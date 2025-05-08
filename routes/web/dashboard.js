const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../../middleware/web/auth');
const Course = require('../../models/Course');
const CourseAssignment = require('../../models/CourseAssignment');
const Examination = require('../../models/Examination');
const ExamResult = require('../../models/ExamResult');

// Dashboard page
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    let dashboardData = {};
    
    // If user is admin, get dashboard stats
    if (req.user.role === 'admin') {
      // Get counts for admin dashboard
      const coursesCount = await Course.countDocuments();
      const examinationsCount = await Examination.countDocuments();
      const resultsCount = await ExamResult.countDocuments();
      
      // Get recent courses
      const recentCourses = await Course.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'name');
      
      dashboardData = {
        coursesCount,
        examinationsCount,
        resultsCount,
        recentCourses
      };
    } else {
      // For members, get assigned courses and results
      const assignments = await CourseAssignment.find({ member: req.user.id })
        .populate('course', 'name');
      
      const courseIds = assignments.map(assignment => assignment.course._id);
      
      // Get examinations for assigned courses
      const examinations = await Examination.find({ course: { $in: courseIds } })
        .populate('course', 'name');
      
      // Get results for this member
      const results = await ExamResult.find({ 
        member: req.user.id,
        status: { $in: ['completed', 'auto-submitted'] }
      })
        .sort({ endTime: -1 })
        .limit(5)
        .populate('examination', 'name')
        .populate('course', 'name');
      
      dashboardData = {
        assignedCourses: assignments,
        examinations,
        results
      };
    }
    
    res.render('pages/dashboard/index', {
      title: 'Dashboard',
      user: req.user,
      dashboardData
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error_msg', 'Error loading dashboard data');
    res.render('pages/dashboard/index', {
      title: 'Dashboard',
      user: req.user,
      dashboardData: {}
    });
  }
});

module.exports = router;