import Conversation from '../models/Conversation.js';
import ChatMessage from '../models/ChatMessage.js';
import Ticket from '../models/Ticket.js';
import AppError from '../utils/errorUtils.js';
import { validateMessageContent, validateTicketSubject, validateTicketDescription } from '../utils/sanitization.js';
import {
    startOrGetConversation,
    saveAndBroadcastMessage,
    createSupportTicket,
} from '../services/supportService.js';
import { uploadToCloudinary } from '../utils/uploadUtils.js';

// ─── GET or CREATE conversation ───────────────────────────────────────────────
export const getOrCreateConversation = async (req, res, next) => {
    try {
        const conversation = await startOrGetConversation(req.user._id);
        const messages = await ChatMessage.find({ conversationId: conversation._id })
            .sort({ createdAt: 1 })
            .limit(100)
            .lean();

        res.status(200).json({
            status: 'success',
            data: { conversation, messages },
        });
    } catch (err) {
        next(err);
    }
};

// ─── SEND a user message ──────────────────────────────────────────────────────
export const sendUserMessage = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { content, type = 'text', attachments = [] } = req.body;

        // Validate and sanitize message content
        const contentValidation = validateMessageContent(content);
        if (!contentValidation.isValid) {
            return next(new AppError(contentValidation.message, 400));
        }

        // Validate message type
        const validTypes = ['text', 'image', 'system'];
        if (!validTypes.includes(type)) {
            return next(new AppError('Invalid message type', 400));
        }

        // Verify user owns this conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: req.user._id,
        });

        if (!conversation) {
            return next(new AppError('Conversation not found', 404));
        }

        const message = await saveAndBroadcastMessage({
            conversationId,
            sender: req.user._id,
            senderRole: 'user',
            senderName: req.user.name,
            senderAvatar: req.user.avatar || null,
            content: contentValidation.sanitized,
            type,
            attachments,
        });

        res.status(201).json({
            status: 'success',
            data: { message },
        });
    } catch (err) {
        next(err);
    }
};

// ─── CREATE a support ticket ──────────────────────────────────────────────────
export const createTicket = async (req, res, next) => {
    try {
        const {
            conversationId,
            subject,
            description,
            issueType,
            priority,
            screenshotUrls,
            screenshotPublicIds,
            consoleLogs,
            apiFailures,
            timeline,
            sessionMetadata,
        } = req.body;

        if (!conversationId) return next(new AppError('conversationId is required', 400));
        
        // Validate and sanitize subject
        const subjectValidation = validateTicketSubject(subject);
        if (!subjectValidation.isValid) {
            return next(new AppError(subjectValidation.message, 400));
        }
        
        // Validate and sanitize description
        const descriptionValidation = validateTicketDescription(description);
        if (!descriptionValidation.isValid) {
            return next(new AppError(descriptionValidation.message, 400));
        }
        
        // Validate screenshot count
        if (screenshotUrls && screenshotUrls.length > 3) {
            return next(new AppError('Maximum of 3 screenshots allowed per ticket', 400));
        }

        // Verify user owns this conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: req.user._id,
        });
        if (!conversation) return next(new AppError('Conversation not found', 404));

        const ticket = await createSupportTicket({
            conversationId,
            userId: req.user._id,
            subject: subjectValidation.sanitized,
            description: descriptionValidation.sanitized,
            issueType,
            priority,
            screenshotUrls: screenshotUrls || [],
            screenshotPublicIds: screenshotPublicIds || [],
            consoleLogs: consoleLogs || [],
            apiFailures: apiFailures || [],
            timeline: timeline || [],
            sessionMetadata: sessionMetadata || null,
        });

        // Send a system message into the conversation
        await saveAndBroadcastMessage({
            conversationId,
            sender: req.user._id,
            senderRole: 'user',
            senderName: req.user.name,
            content: `🎫 Support ticket created: **${subject}**`,
            type: 'system',
        });

        res.status(201).json({
            status: 'success',
            data: { ticket },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET user's own tickets ───────────────────────────────────────────────────
export const getUserTickets = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = { userId: req.user._id };
        if (status) filter.status = status;

        const tickets = await Ticket.find(filter)
            .sort({ lastActivityAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const total = await Ticket.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            data: { tickets, total, page: Number(page), pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        next(err);
    }
};

// ─── UPLOAD screenshot to Cloudinary ─────────────────────────────────────────
export const uploadScreenshot = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('No file provided', 400));
        }

        const { ticketId } = req.body;

        // Enforce max 3 screenshots per ticket
        if (ticketId) {
            const ticket = await Ticket.findOne({ _id: ticketId, userId: req.user._id });
            if (ticket && ticket.screenshotUrls.length >= 3) {
                return next(new AppError('Maximum of 3 screenshots allowed per ticket', 400));
            }
        }

        const result = await uploadToCloudinary(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (err) {
        next(err);
    }
};
