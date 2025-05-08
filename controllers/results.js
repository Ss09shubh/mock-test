const ExamResult = require('../models/ExamResult');
const CourseAssignment = require('../models/CourseAssignment');

// @desc    Get all exam results
// @route   GET /api/results
// @access  Private
exports.getResults = async (req, res) => {
  try {
    let results;

    // If user is admin, get all results
    if (req.user.role === 'admin') {
      results = await ExamResult.find({ status: 'completed' })
        .populate([
          { path: 'examination', select: 'name totalMarks passMarks' },
          { path: 'course', select: 'name' },
          { path: 'member', select: 'name email' }
        ]);
    } else {
      // If user is member, get only their results
      results = await ExamResult.find({ 
        member: req.user.id,
        status: 'completed'
      })
        .populate([
          { path: 'examination', select: 'name totalMarks passMarks' },
          { path: 'course', select: 'name' }
        ]);
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single exam result
// @route   GET /api/results/:id
// @access  Private
exports.getResult = async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.id)
      .populate([
        { path: 'examination', select: 'name totalMarks passMarks questions' },
        { path: 'course', select: 'name' },
        { path: 'member', select: 'name email' }
      ]);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // If user is member, check if result belongs to them
    if (req.user.role === 'member' && result.member._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this result'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get results for a specific member
// @route   GET /api/results/member/:memberId
// @access  Private/Admin
exports.getMemberResults = async (req, res) => {
  try {
    const results = await ExamResult.find({ 
      member: req.params.memberId,
      status: 'completed'
    })
      .populate([
        { path: 'examination', select: 'name totalMarks passMarks' },
        { path: 'course', select: 'name' },
        { path: 'member', select: 'name email' }
      ]);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get results for a specific course
// @route   GET /api/results/course/:courseId
// @access  Private/Admin
exports.getCourseResults = async (req, res) => {
  try {
    const results = await ExamResult.find({ 
      course: req.params.courseId,
      status: 'completed'
    })
      .populate([
        { path: 'examination', select: 'name totalMarks passMarks' },
        { path: 'course', select: 'name' },
        { path: 'member', select: 'name email' }
      ]);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};