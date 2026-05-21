import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        publicId: { type: String }, // Cloudinary public_id for deletion
        mimeType: { type: String, required: true },
        fileName: { type: String, required: true },
        sizeBytes: { type: Number, required: true },
    },
    { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },

        // sender can be a userId (ObjectId), 'bot', or 'admin'
        sender: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        senderRole: {
            type: String,
            enum: ['user', 'admin', 'bot'],
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        senderAvatar: {
            type: String,
            default: null,
        },

        content: {
            type: String,
            required: true,
            maxlength: 5000,
        },

        type: {
            type: String,
            enum: ['text', 'image', 'system'],
            default: 'text',
        },

        // URL-based attachments — never base64
        attachments: [attachmentSchema],

        // Read receipt tracking
        readBy: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                readAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Efficient retrieval: get all messages for a conversation sorted by time
chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
