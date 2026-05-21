import Test from '../models/Test.js';
import TestAttempt from '../models/TestAttempt.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// Get all tests - published for users, all statuses for admins
export const getAvailableTests = async (req, res) => {
  try {
    // Admins see all tests including drafts, regular users see only published tests
    let query = {};
    
    if (req.user.role === 'admin' || req.user.role === 'super-admin') {
      // Admins see all their tests regardless of status
      query = {};
    } else {
      // Regular users only see published tests
      query = {
        status: 'published',
        isActive: true
      };
    }

    let tests = await Test.find(query).select('-questions.correctAnswers');

    // For regular users, filter based on visibility and assigned emails
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      const userEmail = req.user.email;
      
      // Filter tests:
      // - Show public tests to everyone
      // - Show private tests only if user's email is assigned
      tests = tests.filter(test => {
        const visibility = test.accessControl?.visibility || 'public';
        
        if (visibility === 'public') {
          return true; // Show all public tests
        } else if (visibility === 'private') {
          // Show private test only if user is assigned
          const isAssigned = test.assignedEmails?.some(a => a.email === userEmail);
          return isAssigned;
        }
        return false;
      });

      // Filter out unseen tests
      const unseenAttempts = await TestAttempt.find({ userId: req.user.id, isUnseen: true }).select('testId');
      const unseenTestIds = unseenAttempts.map(a => a.testId.toString());
      
      tests = tests.filter(test => !unseenTestIds.includes(test._id.toString()));
    }

    res.status(200).json({
      success: true,
      data: tests,
      count: tests.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tests',
      error: error.message
    });
  }
};

// Get test by ID with full details
export const getTestById = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findOne({ testId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Don't show correct answers to regular users
    if (req.user.role !== 'admin') {
      test.questions.forEach(q => {
        q.correctAnswers = [];
      });
    }

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test',
      error: error.message
    });
  }
};

// Create new test (Admin only)
export const createTest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, category, durationMinutes, questions, settings, instructions } = req.body;

    // Validate questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required',
        error: 'EMPTY_QUESTIONS'
      });
    }

    // Validate each question has valid marks
    const invalidQuestions = questions.filter(q => !q.marks || q.marks <= 0 || isNaN(q.marks));
    if (invalidQuestions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All questions must have marks >= 1',
        error: 'INVALID_MARKS',
        invalidQuestions: invalidQuestions.map((q, idx) => `Question ${idx + 1}: marks=${q.marks}`)
      });
    }

    // Calculate total marks
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
      status: 'draft'
    });

    await test.save();

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'VALIDATION_ERROR',
        details: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating test',
      error: error.message
    });
  }
};

// Update test (Admin only)
export const updateTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { title, description, category, durationMinutes, questions, settings, instructions, status } = req.body;

    const query = req.user.role === 'admin' ? { testId } : { testId, createdBy: req.user.id };
    let test = await Test.findOne(query);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found' // 404 to prevent enumeration
      });
    }

    // Validate questions
    if (questions && questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required',
        error: 'EMPTY_QUESTIONS'
      });
    }

    // Validate each question has valid marks
    if (questions) {
      const invalidQuestions = questions.filter(q => !q.marks || q.marks <= 0 || isNaN(q.marks));
      if (invalidQuestions.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'All questions must have marks >= 1',
          error: 'INVALID_MARKS',
          invalidQuestions: invalidQuestions.map((q, idx) => `Question ${idx + 1}: marks=${q.marks}`)
        });
      }
    }

    // Calculate total marks
    const totalMarks = questions ? questions.reduce((sum, q) => sum + (q.marks || 0), 0) : test.totalMarks;

    test = await Test.findOneAndUpdate(
      query,
      {
        title,
        description,
        category,
        durationMinutes,
        questions,
        totalMarks,
        settings,
        instructions,
        status,
        updatedAt: Date.now()
      },
      { returnDocument: 'after', runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      data: test
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: 'VALIDATION_ERROR',
        details: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating test',
      error: error.message
    });
  }
};

// Start test attempt
export const startTestAttempt = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const test = await Test.findOne({ testId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user already has an in-progress attempt
    const existingAttempt = await TestAttempt.findOne({
      testId,
      userId,
      status: 'in-progress'
    });

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        data: existingAttempt,
        message: 'Resuming existing attempt'
      });
    }

    // Create new attempt
    const testAttempt = new TestAttempt({
      testId,
      userId,
      startedAt: new Date(),
      totalMarksPossible: test.totalMarks,
      answers: test.questions.map(q => ({
        questionId: q.id,
        selectedOptions: [],
        timeTaken: 0
      }))
    });

    await testAttempt.save();

    res.status(201).json({
      success: true,
      message: 'Test attempt started',
      data: testAttempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting test',
      error: error.message
    });
  }
};

// Save answer (auto-save during test)
export const saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptions, timeTaken } = req.body;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    // Update or create answer
    const answerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
    if (answerIndex >= 0) {
      attempt.answers[answerIndex].selectedOptions = selectedOptions;
      attempt.answers[answerIndex].timeTaken = timeTaken;
    } else {
      attempt.answers.push({
        questionId,
        selectedOptions,
        timeTaken
      });
    }

    attempt.updatedAt = Date.now();
    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Answer saved',
      data: attempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving answer',
      error: error.message
    });
  }
};

// Submit test
export const submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId).populate('testId');
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    const test = attempt.testId;
    let totalMarksObtained = 0;
    let correctCount = 0;

    // Calculate marks
    attempt.answers.forEach((answer) => {
      const question = test.questions.find(q => q.id === answer.questionId);
      if (!question) return;

      const isCorrect = JSON.stringify(answer.selectedOptions.sort()) ===
        JSON.stringify(question.correctAnswers.sort());

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
    const isPassed = percentage >= passingMarks;

    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.totalMarksObtained = totalMarksObtained;
    attempt.percentage = percentage;
    attempt.isPassed = isPassed;
    attempt.updatedAt = Date.now();

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        attemptId: attempt._id,
        totalMarksObtained,
        totalMarksPossible: test.totalMarks,
        percentage: percentage.toFixed(2),
        correctAnswers: correctCount,
        totalQuestions: test.questions.length,
        isPassed,
        status: 'submitted'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting test',
      error: error.message
    });
  }
};

// Get test results
export const getTestResults = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId).populate('testId userId');
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// Get user's test history
export const getUserTestHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    let query = { userId };
    if (status) query.status = status;

    const attempts = await TestAttempt.find(query)
      .populate('testId', 'title category totalMarks')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await TestAttempt.countDocuments(query);

    res.status(200).json({
      success: true,
      data: attempts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching test history',
      error: error.message
    });
  }
};

// Admin: Get test details, users, and attempts
export const getTestDetailsAdmin = async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Validate authorization
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(404).json({ success: false, message: 'Test not found' }); // 404 to prevent enumeration
    }

    const query = req.user.role === 'admin' ? { testId } : { testId, createdBy: req.user.id };
    let test = await Test.findOne(query)
      .populate('assignedUsers', 'name email profilePicture')
      .populate('createdBy', 'name');
      
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // If published, fetch all non-admin users so they show up in the table
    if (test.status === 'published' || test.publishedAccess === 'Public') {
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
        test,
        attempts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching test admin details', error: error.message });
  }
};

// Admin: Update test attempt toggles (unseen, more option)
export const updateTestAttemptToggle = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { isUnseen, allowRetake, isMoreOptionOn } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Test attempt not found' });
    }

    if (isUnseen !== undefined) attempt.isUnseen = isUnseen;
    if (allowRetake !== undefined) attempt.allowRetake = allowRetake;
    if (isMoreOptionOn !== undefined) attempt.isMoreOptionOn = isMoreOptionOn;
    if (req.body.isBlocked !== undefined) attempt.isBlocked = req.body.isBlocked;
    
    attempt.updatedAt = Date.now();
    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Attempt toggles updated',
      data: attempt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating attempt toggle', error: error.message });
  }
};

// Admin: Force Submit Attempt
export const forceSubmitAttemptAdmin = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

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
    attempt.timeSpentSeconds = Math.floor((attempt.submittedAt.getTime() - new Date(attempt.startedAt).getTime()) / 1000);
    attempt.totalMarksObtained = totalMarksObtained;
    attempt.percentage = percentage;
    attempt.isPassed = percentage >= passingMarks;
    attempt.updatedAt = Date.now();
    attempt.isBlocked = false; // Unblock if they were blocked

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

// Admin: Delete attempt for retake
export const deleteTestAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const attempt = await TestAttempt.findByIdAndDelete(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Test attempt not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Attempt deleted to allow retake'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting attempt', error: error.message });
  }
};

// Delete test (Admin only)
export const deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const query = req.user.role === 'admin' ? { testId } : { testId, createdBy: req.user.id };
    const test = await Test.findOne(query);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found' // 404 obfuscation
      });
    }

    // Find and delete all attempts for this test using its internal _id
    await TestAttempt.deleteMany({ testId: test._id });

    // Delete the test itself
    await Test.deleteOne(query);

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting test',
      error: error.message
    });
  }
};

import jwt from 'jsonwebtoken';

// Admin: Generate share token
export const generateShareToken = async (req, res) => {
  try {
    const { testId } = req.params;

    const query = req.user.role === 'admin' ? { testId } : { testId, createdBy: req.user.id };
    const test = await Test.findOne(query);

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Sign minimal payload with versioning
    const token = jwt.sign(
      { testId: test.testId, scope: 'preview', version: test.shareTokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ success: true, data: { shareToken: token } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating share token', error: error.message });
  }
};

// Public: Get shared test by JWT token
export const getSharedTest = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.scope !== 'preview') {
      return res.status(403).json({ success: false, message: 'Invalid token scope' });
    }

    const test = await Test.findOne({ testId: decoded.testId });
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Validate version to allow revocation
    if (test.shareTokenVersion !== decoded.version) {
      return res.status(403).json({ success: false, message: 'Share link has been revoked or expired' });
    }

    // DTO shaping: strict sanitization for preview
    const sanitizedTest = test.toJSON();
    if (sanitizedTest.questions) {
      sanitizedTest.questions.forEach(q => {
        delete q.correctAnswers;
      });
    }

    res.status(200).json({ success: true, data: sanitizedTest });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Share link has expired' });
    }
    return res.status(403).json({ success: false, message: 'Invalid share link' });
  }
};
