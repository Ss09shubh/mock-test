const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    required: true
  },
  options: [OptionSchema]
});

const ExaminationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an examination name'],
    trim: true,
    maxlength: [100, 'Examination name cannot be more than 100 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please add total marks']
  },
  passMarks: {
    type: Number,
    required: [true, 'Please add pass marks']
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Please add examination duration in minutes']
  },
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Examination', ExaminationSchema);