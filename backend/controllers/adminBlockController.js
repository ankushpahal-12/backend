import TestAttempt from '../models/TestAttempt.js';
import Test from '../models/Test.js';
import { sendUnblockNotificationEmail } from '../services/emailService.js';

/**
 * Get all blocked users for a test
 * GET /api/v1/admin/blocked-users/:testId
 */
export const getBlockedUsers = async (req, res) => {
  try {
    const { testId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify user is admin or test creator
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only test creator or admin can view blocked users'
      });
    }

    // Get blocked attempts
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const blockedAttempts = await TestAttempt.find({
      testId: test._id,
      isBlocked: true
    })
      .populate('userId', 'email username firstName lastName')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await TestAttempt.countDocuments({
      testId: test._id,
      isBlocked: true
    });

    const blockedUsers = blockedAttempts.map(attempt => ({
      attemptId: attempt._id,
      userId: attempt.userId?._id,
      email: attempt.userId?.email,
      username: attempt.userId?.username,
      userName: `${attempt.userId?.firstName} ${attempt.userId?.lastName}`,
      blockedAt: attempt.updatedAt,
      status: attempt.status,
      marksObtained: attempt.totalMarksObtained,
      blockedReason: attempt.blockReason || 'Suspicious activity detected'
    }));

    res.status(200).json({
      success: true,
      data: {
        blockedUsers,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blocked users',
      error: error.message
    });
  }
};

/**
 * Unblock a user from a test
 * PATCH /api/v1/admin/unblock-user/:attemptId
 */
export const unblockUser = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { reason } = req.body;

    const attempt = await TestAttempt.findById(attemptId)
      .populate('userId', 'email firstName lastName')
      .populate('testId', 'title');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Verify authorization
    const test = await Test.findById(attempt.testId);
    if (test.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only test creator or admin can unblock users'
      });
    }

    if (!attempt.isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'This user is not blocked'
      });
    }

    // Unblock the user
    attempt.isBlocked = false;
    attempt.unblockReason = reason || 'Unblocked by admin';
    attempt.unblockedAt = new Date();
    attempt.unblockedBy = req.user.id;
    await attempt.save();

    // Send unblock notification email
    if (attempt.userId?.email) {
      await sendUnblockNotificationEmail(attempt.userId.email, test.title);
    }

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: {
        attemptId: attempt._id,
        userEmail: attempt.userId?.email,
        testTitle: test.title,
        unblockedAt: attempt.unblockedAt
      }
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unblocking user',
      error: error.message
    });
  }
};

/**
 * Block a user manually
 * PATCH /api/v1/admin/block-user/:attemptId
 */
export const blockUser = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { reason } = req.body;

    const attempt = await TestAttempt.findById(attemptId)
      .populate('userId', 'email firstName lastName')
      .populate('testId', 'title');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Verify authorization
    const test = await Test.findById(attempt.testId);
    if (test.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only test creator or admin can block users'
      });
    }

    if (attempt.isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'This user is already blocked'
      });
    }

    // Block the user
    attempt.isBlocked = true;
    attempt.blockReason = reason || 'Manually blocked by admin';
    attempt.blockedAt = new Date();
    attempt.blockedBy = req.user.id;
    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: {
        attemptId: attempt._id,
        userEmail: attempt.userId?.email,
        testTitle: test.title,
        blockedAt: attempt.blockedAt,
        blockReason: attempt.blockReason
      }
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking user',
      error: error.message
    });
  }
};

/**
 * Get block history for a user
 * GET /api/v1/admin/block-history/:userId
 */
export const getBlockHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify authorization
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own block history'
      });
    }

    const history = await TestAttempt.find({
      userId,
      isBlocked: true
    })
      .populate('testId', 'title')
      .populate('blockedBy', 'email')
      .sort({ blockedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        history: history.map(h => ({
          attemptId: h._id,
          testTitle: h.testId?.title,
          blockedAt: h.blockedAt,
          blockReason: h.blockReason,
          blockedBy: h.blockedBy?.email || 'System',
          status: h.isBlocked ? 'Blocked' : 'Unblocked',
          unblockedAt: h.unblockedAt || null
        }))
      }
    });
  } catch (error) {
    console.error('Get block history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching block history',
      error: error.message
    });
  }
};

/**
 * Get comprehensive blocking statistics
 * GET /api/v1/admin/block-statistics/:testId
 */
export const getBlockStatistics = async (req, res) => {
  try {
    const { testId } = req.params;

    // Verify authorization
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only test creator or admin can view statistics'
      });
    }

    // Get statistics
    const totalAttempts = await TestAttempt.countDocuments({ testId });
    const blockedAttempts = await TestAttempt.countDocuments({ testId, isBlocked: true });
    const completedAttempts = await TestAttempt.countDocuments({ 
      testId, 
      status: { $in: ['submitted', 'graded'] },
      isBlocked: false
    });
    const inProgressAttempts = await TestAttempt.countDocuments({ 
      testId, 
      status: 'in-progress',
      isBlocked: false
    });

    // Get block reasons distribution
    const blockReasons = await TestAttempt.aggregate([
      { $match: { testId: test._id, isBlocked: true } },
      { $group: { _id: '$blockReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        blockedAttempts,
        completedAttempts,
        inProgressAttempts,
        blockPercentage: totalAttempts > 0 ? ((blockedAttempts / totalAttempts) * 100).toFixed(2) : 0,
        blockReasons: blockReasons.map(br => ({
          reason: br._id || 'Unknown',
          count: br.count
        }))
      }
    });
  } catch (error) {
    console.error('Get block statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching block statistics',
      error: error.message
    });
  }
};

export default {
  getBlockedUsers,
  unblockUser,
  blockUser,
  getBlockHistory,
  getBlockStatistics
};
