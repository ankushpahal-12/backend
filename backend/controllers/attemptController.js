import Test from '../models/Test.js';
import TestAttempt from '../models/TestAttempt.js';
import jwt from 'jsonwebtoken';
import { formatCandidateDTO, formatPreviewDTO } from '../utils/testDTOs.js';
import { extractAuditContext, auditLog } from '../utils/auditLogger.js';

// Helper to verify and extract token
const verifyShareToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.tokenType !== 'TEST_SHARE' || decoded.scope !== 'attempt') {
    throw new Error('Invalid token scope or type');
  }
  return decoded;
};

// Preview test details (No questions returned)
export const getPreviewTest = async (req, res) => {
  try {
    const { token } = req.params;
    let decoded;
    let testIdStr = token;
    let decodedVersion = null;
    const isShareToken = token.includes('.'); // Simple heuristic: JWT tokens contain dots
    
    // First, try to decode as JWT. If it fails, assume it's a raw testId for a public test.
    try {
      decoded = verifyShareToken(token);
      testIdStr = decoded.testId;
      decodedVersion = decoded.version;
    } catch (err) {
      if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Share link expired' });
      // If it's malformed, it's likely a raw testId. This is OK - we'll allow unauthenticated access
      // to published tests, and require email verification for private tests instead.
    }

    const test = await Test.findOne({ testId: testIdStr });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    // Validate access: if it was a JWT, check version. If raw testId, allow for authenticated users on published tests.
    if (decodedVersion !== null) {
      if ((test.shareTokenVersion || 1) !== decodedVersion) {
        return res.status(403).json({ success: false, message: 'Share link has been revoked' });
      }
    }
    // Raw testId access: authenticated users can access any published test they found via the available tests list.
    if (test.status !== 'published') {
      return res.status(403).json({ success: false, message: 'Test is not available at the moment' });
    }

    // Check if this is a private test
    const isPrivateTest = test.accessControl?.visibility === 'private';
    
    // For private tests via share link, check if user email is assigned
    let emailAssigned = false;
    let isBlocked = false;
    let blockedMessage = '';

    // Only check user-specific data if user is authenticated
    let existingAttempt = null;
    let hasExistingAttempt = false;

    if (req.user) {
      // Check for blocked status
      existingAttempt = await TestAttempt.findOne({ testId: test._id, userId: req.user.id, status: 'in-progress' });
      hasExistingAttempt = !!existingAttempt;

      if (existingAttempt && existingAttempt.isBlocked) {
        isBlocked = true;
        blockedMessage = 'You have been blocked from this test. Please contact the admin to unblock you.';
      }

      // For private tests, check if user's email is in assigned list
      if (isPrivateTest && req.user.email) {
        emailAssigned = test.assignedEmails?.some(a => a.email === req.user.email) || false;
      }

      // Retake logic for non-admins
      if (!isBlocked && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
        const completedAttempts = await TestAttempt.find({ 
          testId: test._id, 
          userId: req.user.id, 
          status: { $in: ['submitted', 'graded'] } 
        }).sort({ createdAt: -1 });

        if (completedAttempts.length > 0) {
          const latestAttempt = completedAttempts[0];
          if (!latestAttempt.allowRetake) {
            return res.status(403).json({ 
              success: false, 
              message: 'You have already completed this test. Retakes are not allowed unless granted by an administrator.' 
            });
          }
        }
      }
    }

    // For private tests without authentication or unassigned emails, include verification requirement
    const requiresEmailVerification = isPrivateTest && (!req.user || !emailAssigned);

    res.status(200).json({ 
      success: true, 
      data: {
        ...formatPreviewDTO(test),
        hasExistingAttempt,
        testType: test.accessControl?.visibility || 'public',
        isBlocked,
        blockedMessage,
        requiresEmailVerification,
        emailAssigned
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading test preview', error: error.message });
  }
};

// Start or Resume test attempt (supports both authenticated and unauthenticated users)
export const startAttempt = async (req, res) => {
  try {
    const { token } = req.params;
    const { email: bodyEmail } = req.body;
    const activeSessionId = req.headers['x-session-id'] || 'default-session';

    // Determine user context
    const isAuthenticated = !!req.user;
    const userId = isAuthenticated ? req.user.id : null;
    const userEmail = isAuthenticated ? req.user.email : bodyEmail;
    const userRole = isAuthenticated ? req.user.role : null;

    console.log('📝 startAttempt received:', { 
      bodyEmail,
      isAuthenticated,
      hasUserEmail: !!userEmail,
      reqBody: JSON.stringify(req.body)
    });

    // For unregistered candidates, email is required
    if (!isAuthenticated && !bodyEmail) {
      console.log('❌ Email missing for unregistered user');
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required for unregistered candidates' 
      });
    }

    let testIdStr = token;
    let decodedVersion = null;
    let decoded;

    try {
      decoded = verifyShareToken(token);
      testIdStr = decoded.testId;
      decodedVersion = decoded.version;
    } catch (err) {
      if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Share link expired' });
      // Fallback: assume raw testId. Validation happens below.
    }

    const test = await Test.findOne({ testId: testIdStr });
    if (!test || test.status !== 'published') {
      return res.status(403).json({ success: false, message: 'Test is not available' });
    }

    // Validate start and end times
    const now = new Date();
    if (test.startAt && new Date(test.startAt) > now) {
      const startTime = new Date(test.startAt).toLocaleString('en-GB', { 
        year: 'numeric', month: 'short', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      });
      return res.status(403).json({ 
        success: false, 
        message: `Test is not yet available. It will open on ${startTime}`,
        availableFrom: test.startAt
      });
    }
    
    if (test.endAt && new Date(test.endAt) < now) {
      return res.status(403).json({ 
        success: false, 
        message: 'Test time is over and the test is unavailable to take. Please try to contact the admin.',
        testEnded: true
      });
    }

    // Access control validation
    if (decodedVersion !== null) {
      if ((test.shareTokenVersion || 1) !== decodedVersion) {
        return res.status(403).json({ success: false, message: 'Share link has been revoked' });
      }
    }

    // Check if this is a private test and validate email assignment
    const isPrivateTest = test.accessControl?.visibility === 'private';
    if (isPrivateTest) {
      const emailAssigned = test.assignedEmails?.some(a => a.email === userEmail);
      const isCreatorOrAdmin = isAuthenticated && (userId === test.createdBy.toString() || userRole === 'admin' || userRole === 'super-admin');
      
      if (!emailAssigned && !isCreatorOrAdmin) {
        return res.status(403).json({ 
          success: false, 
          message: 'Your email is not assigned to this test. Please contact the test creator.' 
        });
      }
    }

    // For authenticated users, check for existing attempts
    let existingAttempt = null;
    if (isAuthenticated) {
      existingAttempt = await TestAttempt.findOne({ testId: test._id, userId, status: 'in-progress' });

      if (existingAttempt) {
        if (existingAttempt.isBlocked) {
          return res.status(403).json({ 
            success: false, 
            isBlocked: true, 
            message: 'You have been blocked from this test due to suspicious activity (e.g. opening in multiple tabs). Contact the admin to unblock you.' 
          });
        }

        if (existingAttempt.activeSessionId && existingAttempt.activeSessionId !== activeSessionId) {
          // Block the attempt due to anti-cheat violation
          existingAttempt.isBlocked = true;
          await existingAttempt.save();
          return res.status(403).json({ 
            success: false, 
            isBlocked: true, 
            message: 'You have been blocked for attempting to open the test in multiple locations. Please contact the administrator.' 
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Resuming existing attempt',
          data: {
            test: formatCandidateDTO(test),
            attempt: existingAttempt
          }
        });
      }

      // Retake logic for non-admins
      if (userRole !== 'admin' && userRole !== 'super-admin') {
        const completedAttempts = await TestAttempt.find({ 
          testId: test._id, 
          userId, 
          status: { $in: ['submitted', 'graded'] } 
        }).sort({ createdAt: -1 });

        if (completedAttempts.length > 0) {
          const latestAttempt = completedAttempts[0];
          if (!latestAttempt.allowRetake) {
            return res.status(403).json({ 
              success: false, 
              message: 'You have already completed this test. Retakes are not allowed unless granted by an administrator.' 
            });
          }
        }
      }

      // Private test two-attempt limit for authenticated users
      if (isPrivateTest && userRole !== 'admin' && userRole !== 'super-admin') {
        const allCompletedAttempts = await TestAttempt.find({
          testId: test._id,
          userId,
          status: { $in: ['submitted', 'graded'] }
        });

        // Count regular + admin-granted attempts
        const adminGrantedCount = allCompletedAttempts.filter(a => a.isAdminGrantedRetake).length;
        const totalAttempts = allCompletedAttempts.length;

        // Limit: 1 regular + 1 admin-granted = 2 total
        if (totalAttempts >= 2) {
          return res.status(403).json({
            success: false,
            message: 'You have already used both your attempts for this private test. Please contact the administrator if you need another chance.',
            retakesExhausted: true
          });
        }

        // If already has 1 completed attempt, can only retake if admin-granted
        if (totalAttempts === 1 && adminGrantedCount === 0) {
          return res.status(403).json({
            success: false,
            message: 'You have already completed this test once. Contact the administrator if you need another chance.',
            canContactAdmin: true
          });
        }
      }
    } else {
      // Unauthenticated candidates - private test two-attempt limit
      const allCompletedAttempts = await TestAttempt.find({
        testId: test._id,
        email: userEmail,
        status: { $in: ['submitted', 'graded'] }
      });

      if (isPrivateTest && allCompletedAttempts.length >= 2) {
        return res.status(403).json({
          success: false,
          message: 'You have already used both your attempts for this private test. Please contact the administrator if you need another chance.',
          retakesExhausted: true
        });
      }

      if (isPrivateTest && allCompletedAttempts.length === 1) {
        const adminGrantedCount = allCompletedAttempts.filter(a => a.isAdminGrantedRetake).length;
        if (adminGrantedCount === 0) {
          return res.status(403).json({
            success: false,
            message: 'You have already completed this test once. Contact the administrator if you need another chance.',
            canContactAdmin: true
          });
        }
      }

      // Unauthenticated candidates can resume by matching email and session for private tests
      existingAttempt = await TestAttempt.findOne({ testId: test._id, email: userEmail, status: 'in-progress' });
      if (existingAttempt) {
        if (existingAttempt.isBlocked) {
          return res.status(403).json({ 
            success: false, 
            isBlocked: true, 
            message: 'You have been blocked from this test due to suspicious activity. Contact the admin.' 
          });
        }

        if (existingAttempt.activeSessionId && existingAttempt.activeSessionId !== activeSessionId) {
          return res.status(403).json({ 
            success: false, 
            message: 'Session conflict detected. Please use the same device or browser session to resume.' 
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Resuming existing attempt',
          data: {
            test: formatCandidateDTO(test),
            attempt: existingAttempt
          }
        });
      }
    }

    // New Attempt
    const testAttempt = new TestAttempt({
      testId: test._id,
      userId: userId || null,  // null for unregistered candidates
      email: userEmail,  // Store email for all users (registered and unregistered)
      activeSessionId,
      startedAt: new Date(),
      totalMarksPossible: test.totalMarks,
      answers: test.questions.map(q => ({
        questionId: q.id,
        selectedOptions: [],
        timeTaken: 0
      }))
    });

    await testAttempt.save();

    // Log test attempt start
    const auditContext = extractAuditContext(req);
    await auditLog({
      method: req.method,
      path: req.originalUrl,
      statusCode: 201,
      ...auditContext,
      userId: userId || auditContext.userId,  // Override with actual userId if available
      action: 'test_attempt_started',
      details: {
        attemptId: testAttempt._id.toString(),
        testId: test.testId,
        isAuthenticated,
        email: userEmail
      }
    });

    res.status(201).json({
      success: true,
      message: 'Test attempt started',
      data: {
        test: formatCandidateDTO(test),
        attempt: testAttempt
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired share link' });
    }
    res.status(500).json({ success: false, message: 'Error starting test', error: error.message });
  }
};

// Auto-save snapshot
export const autoSaveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptions, timeTaken } = req.body;
    const activeSessionId = req.headers['x-session-id'] || 'default-session';

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      const auditContext = extractAuditContext(req);
      await auditLog({
        method: req.method,
        path: req.originalUrl,
        statusCode: 404,
        ...auditContext,
        action: 'attempt_not_found',
        details: { attemptId, reason: 'Attempt not found' }
      });
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (attempt.activeSessionId && attempt.activeSessionId !== activeSessionId) {
      const auditContext = extractAuditContext(req);
      await auditLog({
        method: req.method,
        path: req.originalUrl,
        statusCode: 403,
        ...auditContext,
        action: 'session_conflict',
        details: { attemptId, reason: 'Session conflict detected' }
      });
      return res.status(403).json({ success: false, message: 'Session conflict detected' });
    }
    
    if (attempt.isBlocked) {
      const auditContext = extractAuditContext(req);
      await auditLog({
        method: req.method,
        path: req.originalUrl,
        statusCode: 403,
        ...auditContext,
        action: 'attempt_blocked',
        details: { attemptId, reason: 'Attempt is blocked' }
      });
      return res.status(403).json({ success: false, message: 'You have been blocked from this test.' });
    }
    
    if (attempt.status !== 'in-progress') {
      const auditContext = extractAuditContext(req);
      await auditLog({
        method: req.method,
        path: req.originalUrl,
        statusCode: 400,
        ...auditContext,
        action: 'invalid_attempt_status',
        details: { attemptId, currentStatus: attempt.status }
      });
      return res.status(400).json({ success: false, message: 'Cannot save answers for completed test' });
    }

    // Incremental Snapshot Save
    attempt.autoSaveSnapshots.push({
      questionId,
      answer: selectedOptions,
      savedAt: Date.now()
    });

    // Also update current answers array for final evaluation
    const answerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
    if (answerIndex >= 0) {
      attempt.answers[answerIndex].selectedOptions = selectedOptions;
      attempt.answers[answerIndex].timeTaken = timeTaken;
    } else {
      attempt.answers.push({ questionId, selectedOptions, timeTaken });
    }

    attempt.updatedAt = Date.now();
    await attempt.save();

    // Log successful save
    const auditContext = extractAuditContext(req);
    await auditLog({
      method: req.method,
      path: req.originalUrl,
      statusCode: 200,
      ...auditContext,
      action: 'answer_saved',
      details: { attemptId, questionId }
    });

    res.status(200).json({ success: true, message: 'Snapshot saved' });
  } catch (error) {
    const auditContext = extractAuditContext(req);
    await auditLog({
      method: req.method,
      path: req.originalUrl,
      statusCode: 500,
      ...auditContext,
      action: 'answer_save_error',
      details: { error: error.message }
    });
    res.status(500).json({ success: false, message: 'Error saving answer', error: error.message });
  }
};

// Submit test
export const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId).populate('testId');
    if (!attempt || attempt.status !== 'in-progress') {
      const auditContext = extractAuditContext(req);
      await auditLog({
        method: req.method,
        path: req.originalUrl,
        statusCode: 400,
        ...auditContext,
        action: 'invalid_or_already_submitted',
        details: { attemptId, reason: 'Invalid or already submitted attempt' }
      });
      return res.status(400).json({ success: false, message: 'Invalid or already submitted attempt' });
    }
    
    if (attempt.isBlocked) {
      const auditContext = extractAuditContext(req);
      await auditLog({
        method: req.method,
        path: req.originalUrl,
        statusCode: 403,
        ...auditContext,
        action: 'blocked_submission_attempt',
        details: { attemptId, reason: 'Attempt is blocked' }
      });
      return res.status(403).json({ success: false, message: 'You have been blocked from this test.' });
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

    await attempt.save();

    // Log successful submission
    const auditContext = extractAuditContext(req);
    await auditLog({
      method: req.method,
      path: req.originalUrl,
      statusCode: 200,
      ...auditContext,
      action: 'test_submitted',
      details: {
        attemptId: attempt._id.toString(),
        totalMarksObtained,
        totalMarksPossible: test.totalMarks,
        percentage: percentage.toFixed(2),
        isPassed: attempt.isPassed,
        timeSpentSeconds: attempt.timeSpentSeconds
      }
    });

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        attemptId: attempt._id,
        totalMarksObtained,
        totalMarksPossible: test.totalMarks,
        percentage: percentage.toFixed(2),
        isPassed: attempt.isPassed
      }
    });
  } catch (error) {
    const auditContext = extractAuditContext(req);
    await auditLog({
      method: req.method,
      path: req.originalUrl,
      statusCode: 500,
      ...auditContext,
      action: 'submission_error',
      details: { error: error.message }
    });
    res.status(500).json({ success: false, message: 'Error submitting test', error: error.message });
  }
};
