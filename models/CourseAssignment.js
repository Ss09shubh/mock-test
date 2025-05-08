const mongoose = require('mongoose');

const CourseAssignmentSchema = new mongoose.Schema({
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
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate assignments
CourseAssignmentSchema.index({ course: 1, member: 1 }, { unique: true });

module.exports = mongoose.model('CourseAssignment', CourseAssignmentSchema);