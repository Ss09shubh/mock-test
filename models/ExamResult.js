const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: {
    type: mongoose.Schema.Types.ObjectId
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  marksObtained: {
    type: Number,
    default: 0
  }
});

const ExamResultSchema = new mongoose.Schema({
  examination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Examination',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  totalMarksObtained: {
    type: Number,
    default: 0
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  answers: [AnswerSchema],
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'auto-submitted'],
    default: 'in-progress'
  }
});

module.exports = mongoose.model('ExamResult', ExamResultSchema);