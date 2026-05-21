import Conversation from '../models/Conversation.js';
import ChatMessage from '../models/ChatMessage.js';
import Ticket from '../models/Ticket.js';
import { isValidTransition } from '../utils/ticketLifecycle.js';
import { getIO } from '../socket.js';
import AppError from '../utils/errorUtils.js';

// ─── Sensitive fields to strip from session logs before saving ────────────────
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'authorization', 'auth', 'credential', 'passwd', 'pass'];

const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s))) {
            out[k] = '***';
        } else if (typeof v === 'object') {
            out[k] = sanitizeObject(v);
        } else {
            out[k] = v;
        }
    }
    return out;
};

// ─── Conversation helpers ─────────────────────────────────────────────────────

/**
 * Returns the user's active conversation or creates a new one.
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {Promise<Object>} The conversation document
 */
export const startOrGetConversation = async (userId) => {
    let conversation = await Conversation.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });

    if (!conversation) {
        conversation = await Conversation.create({ userId });
    }

    return conversation;
};

/**
 * Saves a chat message and broadcasts it over Socket.IO.
 * Also updates the conversation's lastActivityAt and lastUserMessageAt / lastAdminReplyAt.
 * @param {Object} params - Message parameters
 * @param {string} params.conversationId - The conversation ID
 * @param {string|Object} params.sender - The sender's ID or role identifier
 * @param {string} params.senderRole - The sender's role: 'user', 'admin', or 'bot'
 * @param {string} params.senderName - The display name of the sender
 * @param {string} [params.senderAvatar] - Optional avatar URL
 * @param {string} params.content - The message content
 * @param {string} [params.type='text'] - Message type: 'text', 'image', or 'system'
 * @param {Array} [params.attachments=[]] - Array of attachment objects
 * @returns {Promise<Object>} The created message document
 */
export const saveAndBroadcastMessage = async ({
    conversationId,
    sender,
    senderRole,
    senderName,
    senderAvatar = null,
    content,
    type = 'text',
    attachments = [],
}) => {
    const message = await ChatMessage.create({
        conversationId,
        sender,
        senderRole,
        senderName,
        senderAvatar,
        content,
        type,
        attachments,
    });

    // Update conversation timestamps atomically
    const timestampUpdate = { lastActivityAt: new Date() };
    if (senderRole === 'user') timestampUpdate.lastUserMessageAt = new Date();
    if (senderRole === 'admin') timestampUpdate.lastAdminReplyAt = new Date();
    if (senderRole === 'user') {
        // Increment unread count for admin
        await Conversation.findByIdAndUpdate(conversationId, {
            ...timestampUpdate,
            $inc: { adminUnreadCount: 1 },
        });
    } else {
        await Conversation.findByIdAndUpdate(conversationId, timestampUpdate);
    }

    // Emit to conversation room (both user and admin see the message)
    try {
        const io = getIO();
        io.to(`conversation:${conversationId}`).emit('support:new_message', {
            message,
            conversationId,
        });

        // Also notify admin inbox of activity
        if (senderRole === 'user') {
            io.to('admin:support').emit('support:conversation_updated', {
                conversationId,
                lastMessage: content.slice(0, 100),
                lastActivityAt: new Date(),
            });
        }
    } catch (_) {
        // Socket not yet initialized — ignore (e.g., during tests)
    }

    return message;
};

// ─── Ticket helpers ───────────────────────────────────────────────────────────

/**
 * Creates a support ticket linked to a conversation.
 * Sanitizes log data before saving.
 * @param {Object} params - Ticket creation parameters
 * @param {string} params.conversationId - The conversation ID
 * @param {string} params.userId - The user's ID
 * @param {string} params.subject - Ticket subject (max 200 chars)
 * @param {string} params.description - Ticket description (max 5000 chars)
 * @param {string} [params.issueType='Other'] - Category of issue
 * @param {string} [params.priority='Medium'] - Ticket priority level
 * @param {Array<string>} [params.screenshotUrls=[]] - Cloudinary URLs (max 3)
 * @param {Array<string>} [params.screenshotPublicIds=[]] - Cloudinary public IDs
 * @param {Array} [params.consoleLogs=[]] - Console error/warning logs
 * @param {Array} [params.apiFailures=[]] - Failed API calls
 * @param {Array} [params.timeline=[]] - User action timeline
 * @param {Object} [params.sessionMetadata=null] - Browser/device metadata
 * @returns {Promise<Object>} The created ticket document
 */
export const createSupportTicket = async ({
    conversationId,
    userId,
    subject,
    description,
    issueType = 'Other',
    priority = 'Medium',
    screenshotUrls = [],
    screenshotPublicIds = [],
    consoleLogs = [],
    apiFailures = [],
    timeline = [],
    sessionMetadata = null,
}) => {
    // Sanitize logs — strip passwords/tokens from API payloads
    const sanitizedApiFailures = apiFailures.map((f) => ({
        ...f,
        payload: sanitizeObject(f.payload),
    }));

    const ticket = await Ticket.create({
        conversationId,
        userId,
        subject,
        description,
        issueType,
        priority,
        status: 'OPEN',
        screenshotUrls,
        screenshotPublicIds,
        consoleLogs: consoleLogs.slice(0, 100), // Cap at 100 log entries
        apiFailures: sanitizedApiFailures.slice(0, 50),
        timeline: timeline.slice(0, 200),
        sessionMetadata,
        lastActivityAt: new Date(),
        lastUserMessageAt: new Date(),
    });

    // Link ticket to conversation
    await Conversation.findByIdAndUpdate(conversationId, {
        $push: { ticketIds: ticket._id },
    });

    // Notify admin inbox of new ticket
    try {
        const io = getIO();
        io.to('admin:support').emit('support:ticket_created', {
            ticket,
            conversationId,
        });
    } catch (_) {}

    return ticket;
};

/**
 * Transitions a ticket's status, enforcing lifecycle rules.
 * Throws AppError for invalid transitions.
 */
export const transitionTicketStatus = async (ticketId, newStatus, actorRole, actorName) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new AppError('Ticket not found', 404);

    if (ticket.status === newStatus) {
        throw new AppError(`Ticket is already in status: ${newStatus}`, 400);
    }

    if (!isValidTransition(ticket.status, newStatus)) {
        throw new AppError(
            `Invalid status transition: ${ticket.status} → ${newStatus}. ` +
            `Allowed: ${ticket.status === 'CLOSED' ? 'none (terminal)' : 'see lifecycle rules'}`,
            400
        );
    }

    const now = new Date();
    ticket.status = newStatus;
    ticket.lastActivityAt = now;
    if (actorRole === 'admin') ticket.lastAdminReplyAt = now;

    await ticket.save();

    // Notify both sides of status change
    try {
        const io = getIO();
        io.to(`conversation:${ticket.conversationId}`).emit('support:status_changed', {
            ticketId,
            conversationId: ticket.conversationId,
            newStatus,
            changedBy: actorName,
        });
        io.to('admin:support').emit('support:status_changed', {
            ticketId,
            conversationId: ticket.conversationId,
            newStatus,
        });
    } catch (_) {}

    return ticket;
};
