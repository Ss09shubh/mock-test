const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../../middleware/web/auth');
const ExamResult = require('../../models/ExamResult');
const Examination = require('../../models/Examination');

// Get all results
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    let results;
    
    // If user is admin, get all results
    if (req.user.role === 'admin') {
      results = await ExamResult.find({ status: { $in: ['completed', 'auto-submitted'] } })
        .populate([
          { path: 'examination', select: 'name totalMarks passMarks' },
          { path: 'course', select: 'name' },
          { path: 'member', select: 'name email' }
        ])
        .sort({ endTime: -1 });
    } else {
      // If user is member, get only their results
      results = await ExamResult.find({ 
        member: req.user.id,
        status: { $in: ['completed', 'auto-submitted'] }
      })
        .populate([
          { path: 'examination', select: 'name totalMarks passMarks' },
          { path: 'course', select: 'name' }
        ])
        .sort({ endTime: -1 });
    }
    
    res.render('pages/results/index', {
      title: 'Examination Results',
      results,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching results');
    res.redirect('/dashboard');
  }
});

// Get single result
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.id)
      .populate([
        { path: 'examination', select: 'name totalMarks passMarks questions' },
        { path: 'course', select: 'name' },
        { path: 'member', select: 'name email' }
      ]);
    
    if (!result) {
      req.flash('error_msg', 'Result not found');
      return res.redirect('/results');
    }
    
    // If user is member, check if result belongs to them
    if (req.user.role === 'member' && result.member._id.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized to access this result');
      return res.redirect('/results');
    }
    
    // Get examination with questions and options
    const examination = await Examination.findById(result.examination._id);
    
    // Map answers to questions and options
    const questionsWithAnswers = examination.questions.map(question => {
      const answer = result.answers.find(a => a.question.toString() === question._id.toString());
      
      return {
        _id: question._id,
        text: question.text,
        marks: question.marks,
        options: question.options,
        selectedOption: answer ? answer.selectedOption : null,
        isCorrect: answer ? answer.isCorrect : false,
        marksObtained: answer ? answer.marksObtained : 0
      };
    });
    
    res.render('pages/results/show', {
      title: 'Examination Result',
      result,
      questionsWithAnswers,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching result');
    res.redirect('/results');
  }
});

// Get results for a specific member (admin only)
router.get('/member/:memberId', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const results = await ExamResult.find({ 
      member: req.params.memberId,
      status: { $in: ['completed', 'auto-submitted'] }
    })
      .populate([
        { path: 'examination', select: 'name totalMarks passMarks' },
        { path: 'course', select: 'name' },
        { path: 'member', select: 'name email' }
      ])
      .sort({ endTime: -1 });
    
    if (results.length === 0) {
      req.flash('error_msg', 'No results found for this member');
      return res.redirect('/results');
    }
    
    res.render('pages/results/member', {
      title: `Results for ${results[0].member.name}`,
      results,
      member: results[0].member,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching results');
    res.redirect('/results');
  }
});

// Get results for a specific course (admin only)
router.get('/course/:courseId', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const results = await ExamResult.find({ 
      course: req.params.courseId,
      status: { $in: ['completed', 'auto-submitted'] }
    })
      .populate([
        { path: 'examination', select: 'name totalMarks passMarks' },
        { path: 'course', select: 'name' },
        { path: 'member', select: 'name email' }
      ])
      .sort({ endTime: -1 });
    
    if (results.length === 0) {
      req.flash('error_msg', 'No results found for this course');
      return res.redirect('/results');
    }
    
    res.render('pages/results/course', {
      title: `Results for ${results[0].course.name}`,
      results,
      course: results[0].course,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching results');
    res.redirect('/results');
  }
});

module.exports = router;