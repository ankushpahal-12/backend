import mongoose from 'mongoose';

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const consoleLogSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['error', 'warn', 'info'], required: true },
        message: { type: String, required: true, maxlength: 2000 },
        timestamp: { type: String },
        stackTrace: { type: String, maxlength: 3000 },
    },
    { _id: false }
);

const apiFailureSchema = new mongoose.Schema(
    {
        method: { type: String },
        url: { type: String },
        status: { type: Number },
        statusText: { type: String },
        duration: { type: String },
        timestamp: { type: String },
        errorDetail: { type: String, maxlength: 1000 },
        // Payload is pre-sanitized (passwords/tokens stripped) before storing
        payload: { type: mongoose.Schema.Types.Mixed },
    },
    { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
    {
        time: { type: String },
        action: { type: String, maxlength: 500 },
        type: {
            type: String,
            enum: ['navigation', 'interaction', 'api', 'error', 'system'],
        },
        details: { type: String, maxlength: 500 },
    },
    { _id: false }
);

const sessionMetadataSchema = new mongoose.Schema(
    {
        browser: String,
        os: String,
        resolution: String,
        userAgent: { type: String, maxlength: 500 },
        connection: String,
        networkStatus: { type: String, enum: ['online', 'offline'] },
        currentRoute: String,
        timezone: String,
    },
    { _id: false }
);

const adminReplySchema = new mongoose.Schema(
    {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        adminName: { type: String },
        message: { type: String, required: true, maxlength: 5000 },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// ─── Main Ticket Schema ──────────────────────────────────────────────────────

const ticketSchema = new mongoose.Schema(
    {
        // Link to conversation (1 conversation → many tickets over time)
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        subject: {
            type: String,
            required: [true, 'Ticket subject is required'],
            trim: true,
            maxlength: [200, 'Subject cannot exceed 200 characters'],
        },

        description: {
            type: String,
            required: [true, 'Ticket description is required'],
            trim: true,
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },

        issueType: {
            type: String,
            enum: ['Login Issue', 'Payment Issue', 'Feature Request', 'Technical Issue', 'Account Issue', 'Other'],
            default: 'Other',
        },

        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium',
        },

        // ── Status Lifecycle ─────────────────────────────────────────────────
        // Valid transitions:
        //   OPEN → IN_PROGRESS
        //   IN_PROGRESS → WAITING_FOR_USER | RESOLVED
        //   WAITING_FOR_USER → IN_PROGRESS
        //   RESOLVED → CLOSED
        //   CLOSED → (terminal)
        status: {
            type: String,
            enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'],
            default: 'OPEN',
            index: true,
        },

        // ── Inbox Sorting Timestamps ─────────────────────────────────────────
        lastActivityAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        lastUserMessageAt: {
            type: Date,
            default: null,
        },
        lastAdminReplyAt: {
            type: Date,
            default: null,
        },

        // ── Screenshot URLs (Cloudinary) — max 3 per ticket ─────────────────
        screenshotUrls: {
            type: [String],
            validate: {
                validator: (arr) => arr.length <= 3,
                message: 'A ticket can have a maximum of 3 screenshots',
            },
            default: [],
        },

        // Cloudinary public_ids for cleanup on ticket deletion
        screenshotPublicIds: {
            type: [String],
            default: [],
        },

        // ── Debug Snapshot (captured at ticket creation) ─────────────────────
        consoleLogs: {
            type: [consoleLogSchema],
            default: [],
        },
        apiFailures: {
            type: [apiFailureSchema],
            default: [],
        },
        timeline: {
            type: [timelineEventSchema],
            default: [],
        },
        sessionMetadata: {
            type: sessionMetadataSchema,
            default: null,
        },

        // ── Admin Replies ────────────────────────────────────────────────────
        adminReplies: {
            type: [adminReplySchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for admin filtering and SLA tracking
ticketSchema.index({ status: 1, lastActivityAt: -1 });
ticketSchema.index({ status: 1, priority: -1, createdAt: -1 });
ticketSchema.index({ userId: 1, status: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
