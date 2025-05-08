const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../../middleware/web/auth');
const Course = require('../../models/Course');
const User = require('../../models/User');
const CourseAssignment = require('../../models/CourseAssignment');
const Examination = require('../../models/Examination');
const { createCourseValidation, assignCourseValidation } = require('../../validation');

// Get all courses
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    let courses;
    
    // If user is admin, get all courses
    if (req.user.role === 'admin') {
      courses = await Course.find().populate('createdBy', 'name');
    } else {
      // If user is member, get only assigned courses
      const assignments = await CourseAssignment.find({ member: req.user.id }).select('course');
      const courseIds = assignments.map(assignment => assignment.course);
      courses = await Course.find({ _id: { $in: courseIds } }).populate('createdBy', 'name');
    }
    
    res.render('pages/courses/index', {
      title: 'Courses',
      courses,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching courses');
    res.redirect('/dashboard');
  }
});

// Show create course form
router.get('/create', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('pages/courses/create', {
    title: 'Create Course',
    user: req.user
  });
});

// Create new course
router.post('/', ensureAuthenticated, ensureAdmin, createCourseValidation, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Create course
    const course = new Course({
      name,
      description,
      createdBy: req.user.id
    });
    
    await course.save();
    
    req.flash('success_msg', 'Course created successfully');
    res.redirect('/courses');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error creating course');
    res.redirect('/courses/create');
  }
});

// Show single course
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('createdBy', 'name');
    
    if (!course) {
      req.flash('error_msg', 'Course not found');
      return res.redirect('/courses');
    }
    
    // If user is member, check if course is assigned to them
    if (req.user.role === 'member') {
      const assignment = await CourseAssignment.findOne({
        course: course._id,
        member: req.user.id
      });
      
      if (!assignment) {
        req.flash('error_msg', 'Not authorized to access this course');
        return res.redirect('/courses');
      }
    }
    
    // Get examinations for this course
    const examinations = await Examination.find({ course: course._id });
    
    // Get members assigned to this course (admin only)
    let assignedMembers = [];
    if (req.user.role === 'admin') {
      assignedMembers = await CourseAssignment.find({ course: course._id })
        .populate('member', 'name email');
    }
    
    res.render('pages/courses/show', {
      title: course.name,
      course,
      examinations,
      assignedMembers,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching course');
    res.redirect('/courses');
  }
});

// Show assign course form
router.get('/:id/assign', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      req.flash('error_msg', 'Course not found');
      return res.redirect('/courses');
    }
    
    // Get all members
    const members = await User.find({ role: 'member' });
    
    // Get already assigned members
    const assignments = await CourseAssignment.find({ course: course._id });
    const assignedMemberIds = assignments.map(assignment => assignment.member.toString());
    
    res.render('pages/courses/assign', {
      title: `Assign ${course.name}`,
      course,
      members,
      assignedMemberIds,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching data');
    res.redirect('/courses');
  }
});

// Assign course to member
router.post('/:id/assign', ensureAuthenticated, ensureAdmin, assignCourseValidation, async (req, res) => {
  try {
    const { memberId } = req.body;
    
    // Check if course exists
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      req.flash('error_msg', 'Course not found');
      return res.redirect('/courses');
    }
    
    // Check if member exists
    const member = await User.findById(memberId);
    
    if (!member || member.role !== 'member') {
      req.flash('error_msg', 'Invalid member');
      return res.redirect(`/courses/${req.params.id}/assign`);
    }
    
    // Check if already assigned
    const existingAssignment = await CourseAssignment.findOne({
      course: course._id,
      member: member._id
    });
    
    if (existingAssignment) {
      req.flash('error_msg', 'Course already assigned to this member');
      return res.redirect(`/courses/${req.params.id}/assign`);
    }
    
    // Create assignment
    const assignment = new CourseAssignment({
      course: course._id,
      member: member._id,
      assignedBy: req.user.id
    });
    
    await assignment.save();
    
    req.flash('success_msg', `Course assigned to ${member.name} successfully`);
    res.redirect(`/courses/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error assigning course');
    res.redirect(`/courses/${req.params.id}/assign`);
  }
});

module.exports = router;