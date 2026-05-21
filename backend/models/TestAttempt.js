import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedOptions: [{ type: String }],
  isCorrect: { type: Boolean },
  marksObtained: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // in seconds
  reviewFlag: { type: Boolean, default: false }
}, { _id: false });

const testAttemptSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional for unregistered candidates accessing via email verification
  },
  email: {
    type: String,
    lowercase: true,
    sparse: true,  // Allow null values, but enforce uniqueness where values exist
    index: true    // Index for efficient lookup by email
  },
  answers: [answerSchema],
  autoSaveSnapshots: [{
    questionId: String,
    answer: [String],
    savedAt: { type: Date, default: Date.now }
  }],
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date },
  timeSpentSeconds: { type: Number, default: 0 },
  totalMarksObtained: { type: Number, default: 0 },
  totalMarksPossible: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded', 'abandoned'],
    default: 'in-progress'
  },
  
  // Attempt Locking
  activeSessionId: { type: String },
  isAttemptInProgress: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },

  // Block Management
  blockReason: { type: String, default: null },
  blockedAt: { type: Date, default: null },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  unblockReason: { type: String, default: null },
  unblockedAt: { type: Date, default: null },
  unblockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  isPassed: { type: Boolean },
  feedback: { type: String },
  isReviewed: { type: Boolean, default: false },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: { type: Date },
  isUnseen: { type: Boolean, default: false },
  allowRetake: { type: Boolean, default: false },
  
  // Admin Retake Management (for private tests)
  isAdminGrantedRetake: { type: Boolean, default: false },
  adminGrantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminGrantedAt: { type: Date, default: null },
  
  isMoreOptionOn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
testAttemptSchema.index({ userId: 1, testId: 1 });
testAttemptSchema.index({ testId: 1, status: 1 });
testAttemptSchema.index({ userId: 1, status: 1 });

export default mongoose.model('TestAttempt', testAttemptSchema);
