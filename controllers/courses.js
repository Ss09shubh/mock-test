const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const CourseAssignment = require('../models/CourseAssignment');
const User = require('../models/User');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

  try {
    const course = new Course({
      name,
      description,
      createdBy: req.user.id
    });

    await course.save();

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    let courses;

    // If user is admin, get all courses
    if (req.user.role === 'admin') {
      courses = await Course.find().populate('createdBy', 'name email');
    } else {
      // If user is member, get only assigned courses
      const assignments = await CourseAssignment.find({ member: req.user.id }).select('course');
      const courseIds = assignments.map(assignment => assignment.course);
      courses = await Course.find({ _id: { $in: courseIds } }).populate('createdBy', 'name email');
    }

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If user is member, check if course is assigned to them
    if (req.user.role === 'member') {
      const assignment = await CourseAssignment.findOne({
        course: course._id,
        member: req.user.id
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this course'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Assign course to member
// @route   POST /api/courses/:id/assign
// @access  Private/Admin
exports.assignCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { memberId } = req.body;

  try {
    // Check if course exists
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if member exists
    const member = await User.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if member is actually a member
    if (member.role !== 'member') {
      return res.status(400).json({
        success: false,
        message: 'User is not a member'
      });
    }

    // Check if course is already assigned to member
    let assignment = await CourseAssignment.findOne({
      course: course._id,
      member: member._id
    });

    if (assignment) {
      return res.status(400).json({
        success: false,
        message: 'Course already assigned to this member'
      });
    }

    // Create assignment
    assignment = new CourseAssignment({
      course: course._id,
      member: member._id,
      assignedBy: req.user.id
    });

    await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};