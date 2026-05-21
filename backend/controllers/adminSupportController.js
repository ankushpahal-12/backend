import Conversation from '../models/Conversation.js';
import ChatMessage from '../models/ChatMessage.js';
import Ticket from '../models/Ticket.js';
import AppError from '../utils/errorUtils.js';
import {
    saveAndBroadcastMessage,
    transitionTicketStatus,
} from '../services/supportService.js';
import { getIO } from '../socket.js';

// ─── GET all conversations (admin inbox) ──────────────────────────────────────
export const getAllConversations = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 30 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        let conversations = await Conversation.find(filter)
            .populate('userId', 'name email avatar role')
            .sort({ lastActivityAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        // Search by user name or email
        if (search) {
            const lc = search.toLowerCase();
            conversations = conversations.filter((c) => {
                const user = c.userId;
                return (
                    user?.name?.toLowerCase().includes(lc) ||
                    user?.email?.toLowerCase().includes(lc)
                );
            });
        }

        // Attach last message preview to each conversation
        const withPreview = await Promise.all(
            conversations.map(async (conv) => {
                const lastMsg = await ChatMessage.findOne({ conversationId: conv._id })
                    .sort({ createdAt: -1 })
                    .lean();
                return {
                    ...conv,
                    lastMessage: lastMsg
                        ? { content: lastMsg.content.slice(0, 80), createdAt: lastMsg.createdAt }
                        : null,
                };
            })
        );

        const total = await Conversation.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            data: { conversations: withPreview, total, page: Number(page) },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET messages for a conversation ─────────────────────────────────────────
export const getConversationMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const conversation = await Conversation.findById(conversationId)
            .populate('userId', 'name email avatar');

        if (!conversation) return next(new AppError('Conversation not found', 404));

        const messages = await ChatMessage.find({ conversationId })
            .sort({ createdAt: 1 })
            .limit(200)
            .lean();

        // Mark admin as having read — reset unread count
        await Conversation.findByIdAndUpdate(conversationId, { adminUnreadCount: 0 });

        // Fetch tickets linked to this conversation
        const tickets = await Ticket.find({
            conversationId,
        })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            status: 'success',
            data: { conversation, messages, tickets },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET all tickets (admin view) ─────────────────────────────────────────────
export const getAllTickets = async (req, res, next) => {
    try {
        const { status, priority, search, page = 1, limit = 30 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const tickets = await Ticket.find(filter)
            .populate('userId', 'name email avatar')
            .sort({ lastActivityAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        // Text search
        const result = search
            ? tickets.filter((t) => {
                const lc = search.toLowerCase();
                return (
                    t.subject?.toLowerCase().includes(lc) ||
                    t.userId?.name?.toLowerCase().includes(lc) ||
                    t.userId?.email?.toLowerCase().includes(lc)
                );
            })
            : tickets;

        const total = await Ticket.countDocuments(filter);

        res.status(200).json({
            status: 'success',
            data: { tickets: result, total, page: Number(page) },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET single ticket detail ─────────────────────────────────────────────────
export const getTicketById = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('userId', 'name email avatar');

        if (!ticket) return next(new AppError('Ticket not found', 404));

        res.status(200).json({
            status: 'success',
            data: { ticket },
        });
    } catch (err) {
        next(err);
    }
};

// ─── SEND admin reply ─────────────────────────────────────────────────────────
export const sendAdminReply = async (req, res, next) => {
    try {
        const { id: ticketId } = req.params;
        const { content, conversationId } = req.body;

        if (!content?.trim()) return next(new AppError('Reply content is required', 400));
        if (!conversationId) return next(new AppError('conversationId is required', 400));

        // Save to ticket's adminReplies
        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            {
                $push: {
                    adminReplies: {
                        adminId: req.user._id,
                        adminName: req.user.name,
                        message: content.trim(),
                        createdAt: new Date(),
                    },
                },
                lastActivityAt: new Date(),
                lastAdminReplyAt: new Date(),
            },
            { new: true }
        );

        if (!ticket) return next(new AppError('Ticket not found', 404));

        // Auto-transition: OPEN → IN_PROGRESS when admin first replies
        if (ticket.status === 'OPEN') {
            await transitionTicketStatus(ticketId, 'IN_PROGRESS', 'admin', req.user.name);
        }

        // Broadcast message to conversation room
        const message = await saveAndBroadcastMessage({
            conversationId,
            sender: req.user._id,
            senderRole: 'admin',
            senderName: req.user.name,
            senderAvatar: req.user.avatar || null,
            content: content.trim(),
            type: 'text',
        });

        res.status(200).json({
            status: 'success',
            data: { message, ticket },
        });
    } catch (err) {
        next(err);
    }
};

// ─── UPDATE ticket status ─────────────────────────────────────────────────────
export const updateTicketStatus = async (req, res, next) => {
    try {
        const { id: ticketId } = req.params;
        const { status: newStatus } = req.body;

        if (!newStatus) return next(new AppError('status is required', 400));

        const ticket = await transitionTicketStatus(
            ticketId,
            newStatus,
            'admin',
            req.user.name
        );

        res.status(200).json({
            status: 'success',
            data: { ticket },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET support stats ────────────────────────────────────────────────────────
export const getSupportStats = async (req, res, next) => {
    try {
        const [total, open, inProgress, waitingForUser, resolved, closed] = await Promise.all([
            Ticket.countDocuments(),
            Ticket.countDocuments({ status: 'OPEN' }),
            Ticket.countDocuments({ status: 'IN_PROGRESS' }),
            Ticket.countDocuments({ status: 'WAITING_FOR_USER' }),
            Ticket.countDocuments({ status: 'RESOLVED' }),
            Ticket.countDocuments({ status: 'CLOSED' }),
        ]);

        res.status(200).json({
            status: 'success',
            data: { total, open, inProgress, waitingForUser, resolved, closed },
        });
    } catch (err) {
        next(err);
    }
};
