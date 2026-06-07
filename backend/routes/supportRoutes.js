import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { uploadMiddleware } from '../utils/uploadUtils.js';

import {
    getOrCreateConversation,
    sendUserMessage,
    createTicket,
    getUserTickets,
    uploadScreenshot,
} from '../controllers/supportController.js';

import {
    getAllConversations,
    getConversationMessages,
    getAllTickets,
    getTicketById,
    sendAdminReply,
    updateTicketStatus,
    getSupportStats,
} from '../controllers/adminSupportController.js';

const router = express.Router();

// Screenshot upload rate limiter: 10 uploads per minute per IP
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { status: 'error', message: 'Too many upload requests. Please try again in a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKeyGenerator,
    skip: (req) => req.method === 'OPTIONS', // Don't count CORS preflight requests
});

// ─── All routes require authentication ───────────────────────────────────────
router.use(protect);

// ─── User Routes ──────────────────────────────────────────────────────────────
// Conversation
router.get('/conversations/me', getOrCreateConversation);
router.post('/conversations/:conversationId/messages', sendUserMessage);

// Tickets
router.post('/tickets', createTicket);
router.get('/tickets/me', getUserTickets);

// Screenshot Upload (Cloudinary)
router.post(
    '/upload/screenshot',
    uploadLimiter,
    (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err) {
                return res.status(400).json({ status: 'error', message: err.message });
            }
            next();
        });
    },
    uploadScreenshot
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.use('/admin', restrictTo('admin'));

// Stats
router.get('/admin/stats', getSupportStats);

// Conversations
router.get('/admin/conversations', getAllConversations);
router.get('/admin/conversations/:conversationId', getConversationMessages);

// Tickets
router.get('/admin/tickets', getAllTickets);
router.get('/admin/tickets/:id', getTicketById);
router.post('/admin/tickets/:id/reply', sendAdminReply);
router.patch('/admin/tickets/:id/status', updateTicketStatus);

export default router;
