import mongoose from 'mongoose';

const annotatedWordSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['normal', 'filler', 'pause-long', 'drift'], default: 'normal' }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: String,
    required: true
  },
  taskType: {
    type: String,
    enum: ['describe-day', 'picture-description', 'story-recall', 'free-speech', 'facial-expression'],
    required: true
  },
  taskTitle: {
    type: String,
    required: true
  },
  ndiScore: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'Mild / Dynamic Variation',
      'Moderate Communication Change Detected',
      'Significant Narrative Degradation Detected'
    ],
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    required: true
  },
  localCoherence: {
    type: Number,
    required: true
  },
  globalCoherence: {
    type: Number,
    required: true
  },
  storyGrammar: {
    type: Number,
    required: true
  },
  speechRate: {
    type: Number,
    required: true
  },
  averagePause: {
    type: Number,
    required: true
  },
  longestPause: {
    type: Number,
    required: true
  },
  whyThisScore: {
    type: [String],
    default: []
  },
  transcript: {
    type: String,
    default: ''
  },
  annotatedWords: {
    type: [annotatedWordSchema],
    default: []
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
