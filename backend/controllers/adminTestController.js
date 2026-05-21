import Test from '../models/Test.js';
import TestAttempt from '../models/TestAttempt.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { formatAdminTestDTO } from '../utils/testDTOs.js';
import jwt from 'jsonwebtoken';
import { sendTestInvitationEmail } from '../services/emailService.js';

// Get all tests for admin
export const getAdminTests = async (req, res) => {
  try {
    const query = req.user.role === 'super-admin' ? {} : { createdBy: req.user.id };
    const tests = await Test.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tests.map(formatAdminTestDTO),
      count: tests.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tests', error: error.message });
  }
};

// Create new test
export const createTest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, category, durationMinutes, questions, settings, instructions, status, accessControl } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required', error: 'EMPTY_QUESTIONS' });
    }

    const invalidQuestions = questions.filter(q => !q.marks || q.marks <= 0 || isNaN(q.marks));
    if (invalidQuestions.length > 0) {
      return res.status(400).json({ success: false, message: 'All questions must have marks >= 1' });
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    const test = new Test({
      title,
      description,
      category,
      durationMinutes,
      totalMarks,
      questions,
      settings,
      instructions,
      createdBy: req.user.id,
      status: status || 'draft',
      accessControl: accessControl || { visibility: 'public', requireLogin: true }
    });

    await test.save();

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: formatAdminTestDTO(test)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating test', error: error.message });
  }
};

// Update test
export const updateTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { title, description, category, durationMinutes, questions, settings, instructions, status, accessControl, assignedEmails, startAt, endAt } = req.body;

    const query = req.user.role === 'admin' ? { testId } : { testId, createdBy: req.user.id };
    let test = await Test.findOne(query);
    
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Track old assignedEmails to detect new additions
    const oldAssignedEmails = test.assignedEmails?.map(a => a.email) || [];
    
    if (questions) {
      if (questions.length === 0) return res.status(400).json({ success: false, message: 'At least one question is required' });
      const invalidQuestions = questions.filter(q => !q.marks || q.marks <= 0 || isNaN(q.marks));
      if (invalidQuestions.length > 0) return res.status(400).json({ success: false, message: 'All questions must have marks >= 1' });
      test.totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
      test.questions = questions;
    }

    if (title) test.title = title;
    if (description !== undefined) test.description = description;
    if (category) test.category = category;
    if (durationMinutes) test.durationMinutes = durationMinutes;
    if (settings) test.settings = settings;
    if (instructions !== undefined) test.instructions = instructions;
    
    if (status && test.status !== status) {
      test.status = status;
      if (status === 'published') test.publishedBy = req.user.id;
    }
    
    if (accessControl) {
      test.accessControl = accessControl;
    }

    // Handle startAt and endAt dates
    if (startAt !== undefined) {
      test.startAt = startAt ? new Date(startAt) : null;
    }
    if (endAt !== undefined) {
      test.endAt = endAt ? new Date(endAt) : null;
    }

    // Handle assignedEmails updates and send invitations if needed
    if (assignedEmails && Array.isArray(assignedEmails)) {
      // Convert email strings to proper schema format with all required fields
      const formattedEmails = assignedEmails.map(a => {
        if (typeof a === 'string') {
          return { email: a.toLowerCase(), assignedAt: Date.now(), emailVerified: false };
        }
        return { 
          email: a.email.toLowerCase(), 
          assignedAt: a.assignedAt || Date.now(), 
          emailVerified: a.emailVerified || false,
          verifiedAt: a.verifiedAt || null
        };
      });
      
      const newAssignedEmails = formattedEmails.map(a => a.email);
      const newlyAddedEmails = newAssignedEmails.filter(email => !oldAssignedEmails.includes(email));
      
      test.assignedEmails = formattedEmails;
      
      // If test is private and new emails were added, send invitations
      const isPrivate = test.accessControl?.visibility === 'private' || accessControl?.visibility === 'private';
      if (newlyAddedEmails.length > 0 && isPrivate) {
        console.log(`📨 Preparing to send test invitations to ${newlyAddedEmails.length} new email(s): ${newlyAddedEmails.join(', ')}`);
        try {
          const shareToken = jwt.sign(
            { 
              testId: test.testId, 
              tokenType: 'TEST_SHARE', 
              scope: 'attempt', 
              version: test.shareTokenVersion || 1 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );
          
          const shareLink = `${process.env.FRONTEND_URL}/attempt/${shareToken}`;
          console.log(`📧 Share link: ${shareLink}`);
          
          // Send invitation emails to newly added users
          for (const email of newlyAddedEmails) {
            console.log(`📧 Sending invitation to ${email}...`);
            await sendTestInvitationEmail(email, test, shareLink);
          }
          
          test.shareCreatedAt = Date.now();
          console.log(`✅ Sent test invitations to ${newlyAddedEmails.length} new assignee(s)`);
        } catch (emailError) {
          console.error('⚠️ Error sending invitation emails:', emailError.message);
          // Don't fail the test update if email sending fails
        }
      } else if (newlyAddedEmails.length > 0 && !isPrivate) {
        console.log(`ℹ️ Test is public - skipping email invitations for ${newlyAddedEmails.length} email(s)`);
      }
    }

    test.editHistory.push({
      editedBy: req.user.id,
      editedAt: Date.now(),
      changes: 'Admin Update'
    });

    test.updatedAt = Date.now();
    await test.save();

    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      data: formatAdminTestDTO(test)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating test', error: error.message });
  }
};

// Delete test
export const deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const query = req.user.role === 'admin' ? { testId } : { testId, createdBy: req.user.id };
    const test = await Test.findOne(query);
    
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    await TestAttempt.deleteMany({ testId: test._id });
    await Test.deleteOne(query);

    res.status(200).json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting test', error: error.message });
  }
};

// Get Test Details Admin
export const getTestDetailsAdmin = async (req, res) => {
  try {
    const { testId } = req.params;
    const query = req.user.role === 'admin' ? { testId } : { testId, createdBy: req.user.id };
    
    let test = await Test.findOne(query)
      .populate('assignedUsers', 'name email profilePicture')
      .populate('createdBy', 'name')
      .populate('editHistory.editedBy', 'name email');
      
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    if (test.status === 'published') {
      const allUsers = await User.find({ role: { $ne: 'admin' } }).select('name email profilePicture');
      test = test.toObject();
      test.assignedUsers = allUsers;
    }

    const attempts = await TestAttempt.find({ testId: test._id })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        test: formatAdminTestDTO(test),
        attempts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching test admin details', error: error.message });
  }
};

// Generate share token
export const generateShareToken = async (req, res) => {
  try {
    const { testId } = req.params;
    const query = req.user.role === 'admin' ? { testId } : { testId, createdBy: req.user.id };
    const test = await Test.findOne(query);

    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    // Enterprise rule: Explicit tokenType and expiresIn instead of manual exp
    const token = jwt.sign(
      { 
        testId: test.testId, 
        tokenType: 'TEST_SHARE', 
        scope: 'attempt', 
        version: test.shareTokenVersion || 1 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    test.shareCreatedAt = Date.now();
    await test.save();

    res.status(200).json({ success: true, data: { shareToken: token } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating share token', error: error.message });
  }
};

// Revoke share links
export const revokeShareLinks = async (req, res) => {
  try {
    const { testId } = req.params;
    const query = req.user.role === 'admin' ? { testId } : { testId, createdBy: req.user.id };
    const test = await Test.findOne(query);

    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    test.shareTokenVersion = (test.shareTokenVersion || 1) + 1;
    await test.save();

    res.status(200).json({ success: true, message: 'All active share links have been revoked.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error revoking share link', error: error.message });
  }
};

export const updateTestAttemptToggle = async (req, res) => {
  // Existing logic for attempt toggles...
  try {
    const { attemptId } = req.params;
    const { isUnseen, allowRetake, isMoreOptionOn } = req.body;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Test attempt not found' });

    if (isUnseen !== undefined) attempt.isUnseen = isUnseen;
    if (allowRetake !== undefined) attempt.allowRetake = allowRetake;
    if (isMoreOptionOn !== undefined) attempt.isMoreOptionOn = isMoreOptionOn;
    if (req.body.isBlocked !== undefined) attempt.isBlocked = req.body.isBlocked;
    
    attempt.updatedAt = Date.now();
    await attempt.save();

    res.status(200).json({ success: true, message: 'Attempt toggles updated', data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating attempt toggle', error: error.message });
  }
};

export const forceSubmitAttemptAdmin = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId).populate('testId');
    if (!attempt || attempt.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Invalid or already submitted attempt' });
    }

    const test = attempt.testId;
    let totalMarksObtained = 0;
    let correctCount = 0;

    attempt.answers.forEach((answer) => {
      const question = test.questions.find(q => q.id === answer.questionId);
      if (!question) return;

      const isCorrect = JSON.stringify(answer.selectedOptions.sort()) === JSON.stringify(question.correctAnswers.sort());

      if (isCorrect) {
        totalMarksObtained += question.marks;
        correctCount++;
        answer.isCorrect = true;
        answer.marksObtained = question.marks;
      } else {
        answer.isCorrect = false;
        const negativeMarks = test.settings?.negativeMarking || 0;
        answer.marksObtained = negativeMarks > 0 ? -negativeMarks : 0;
      }
    });

    const percentage = (totalMarksObtained / test.totalMarks) * 100;
    const passingMarks = test.settings?.passingMarks || 40;

    attempt.status = 'submitted';
    attempt.isAttemptInProgress = false;
    attempt.submittedAt = new Date();
    attempt.totalMarksObtained = totalMarksObtained;
    attempt.percentage = percentage;
    attempt.isPassed = percentage >= passingMarks;
    attempt.updatedAt = Date.now();
    attempt.isBlocked = false;

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Attempt forcibly submitted by Admin',
      data: attempt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting attempt', error: error.message });
  }
};

export const deleteTestAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await TestAttempt.findByIdAndDelete(attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Test attempt not found' });

    res.status(200).json({ success: true, message: 'Attempt deleted to allow retake' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting attempt', error: error.message });
  }
};

// Grant retake for private tests (admin override)
export const grantRetakeForAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const adminId = req.user.id;

    // Find the attempt
    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test attempt not found' 
      });
    }

    // Check if the attempt is already submitted/graded
    if (!['submitted', 'graded'].includes(attempt.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only grant retake for completed attempts' 
      });
    }

    // Check if retake was already granted for this attempt
    if (attempt.isAdminGrantedRetake) {
      return res.status(400).json({ 
        success: false, 
        message: 'Retake has already been granted for this attempt' 
      });
    }

    // Get the test to check if it's private
    const test = await Test.findById(attempt.testId);
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    if (!test.isPrivate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Retakes can only be granted for private tests' 
      });
    }

    // Grant the retake
    attempt.isAdminGrantedRetake = true;
    attempt.adminGrantedBy = adminId;
    attempt.adminGrantedAt = new Date();
    await attempt.save();

    res.status(200).json({ 
      success: true, 
      message: 'Retake granted successfully. User can now take the test one more time.',
      data: attempt
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error granting retake', 
      error: error.message 
    });
  }
};
