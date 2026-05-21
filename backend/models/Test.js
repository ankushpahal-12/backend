import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  marks: { type: Number, required: true, min: 1 },
  allowMultiple: { type: Boolean, default: false },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true }
  }],
  correctAnswers: [{ type: String }],
  explanation: { type: String },
  attachments: [{ type: String }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
}, { _id: false });

const testSchema = new mongoose.Schema({
  testId: { type: String, unique: true },
  shareTokenVersion: { type: Number, default: 1 },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  totalMarks: { type: Number, required: true, min: 1 },
  questions: [questionSchema],
  instructions: { type: String },
  status: {
    type: String,
    enum: ["draft", "published", "archived", "scheduled", "completed"],
    default: "draft"
  },
  settings: {
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    showResultsImmediately: { type: Boolean, default: false },
    allowReview: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: false },
    oneQuestionPerPage: { type: Boolean, default: false },
    negativeMarking: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 40 }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shareCreatedAt: { type: Date },
  
  // Access Control
  accessControl: {
    visibility: { type: String, enum: ['public', 'private', 'invite-only'], default: 'public' },
    requireLogin: { type: Boolean, default: true },
    allowedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },

  // Email assignments for private tests
  assignedEmails: [{
    email: { type: String, lowercase: true },
    assignedAt: { type: Date, default: Date.now },
    emailVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  }],

  // Edit History Tracking
  editHistory: [{
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
    changes: { type: String }
  }],

  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  publishedAccess: { type: String, enum: ['All Assigned Users', 'Public'], default: 'All Assigned Users' },
  isActive: { type: Boolean, default: true },
  startAt: { type: Date, default: null },
  endAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries and authorization
testSchema.index({ createdBy: 1, status: 1 });
testSchema.index({ category: 1 });
testSchema.index({ testId: 1, createdBy: 1 });

// DTO Formatting: Never expose internal _id or __v
testSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.testId;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save hook to generate unique testId
testSchema.pre('save', async function(next) {
  if (!this.testId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let unique = false;
    while (!unique) {
      let result = 'TST-';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Check if it exists
      const existing = await mongoose.model('Test').findOne({ testId: result });
      if (!existing) {
        this.testId = result;
        unique = true;
      }
    }
  }
});

export default mongoose.model('Test', testSchema);
