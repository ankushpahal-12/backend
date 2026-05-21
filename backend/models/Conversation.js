import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: ['active', 'closed'],
            default: 'active',
        },

        // References to tickets created within this conversation
        ticketIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ticket',
            },
        ],

        // Inbox sorting timestamps
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

        // Unread count for admin inbox
        adminUnreadCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient admin inbox queries (active conversations sorted by activity)
conversationSchema.index({ status: 1, lastActivityAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
