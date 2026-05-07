import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../utils/validationSchemas.js';
import { z } from 'zod';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// User Profile & Account Management
router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.patch('/password', userController.updatePassword);
router.get('/sessions', userController.getMySessions);
router.delete('/sessions/:sessionId', userController.terminateSession);

// Recovery Codes & Account Deactivation
// POST: Request recovery code operation (returns OTP)
router.post('/recovery-codes', userController.requestPurgeOtp);
// POST: Verify recovery code operation (verify OTP)
router.post('/recovery-codes/verify', userController.verifyPurgeOtp);
// DELETE: Delete recovery codes and purge account
router.delete('/recovery-codes', userController.purgeAccount);
// DELETE: Deactivate account
router.delete('/deactivate', userController.deactivateAccount);

export default router;
