const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin, ensureMember } = require('../../middleware/web/auth');
const Course = require('../../models/Course');
const Examination = require('../../models/Examination');
const CourseAssignment = require('../../models/CourseAssignment');
const ExamResult = require('../../models/ExamResult');
const { createExaminationValidation, submitExaminationValidation } = require('../../validation');

// Show create examination form
router.get('/create/:courseId', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      req.flash('error_msg', 'Course not found');
      return res.redirect('/courses');
    }
    
    res.render('pages/examinations/create', {
      title: 'Create Examination',
      course,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching course');
    res.redirect('/courses');
  }
});

// Create new examination
router.post('/', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { 
      name, 
      courseId, 
      totalMarks, 
      passMarks, 
      durationMinutes,
      questionTexts,
      questionMarks,
      options,
      correctOptions
    } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    
    if (!course) {
      req.flash('error_msg', 'Course not found');
      return res.redirect('/courses');
    }
    
    // Process questions and options
    const questions = [];
    
    // Handle single question case
    if (!Array.isArray(questionTexts)) {
      const questionOptions = [];
      const optionsArray = options.split(',').map(opt => opt.trim());
      const correctIndex = parseInt(correctOptions);
      
      optionsArray.forEach((optionText, index) => {
        questionOptions.push({
          text: optionText,
          isCorrect: index === correctIndex
        });
      });
      
      questions.push({
        text: questionTexts,
        marks: parseInt(questionMarks),
        options: questionOptions
      });
    } else {
      // Handle multiple questions
      for (let i = 0; i < questionTexts.length; i++) {
        const questionOptions = [];
        const optionsArray = options[i].split(',').map(opt => opt.trim());
        const correctIndex = parseInt(correctOptions[i]);
        
        optionsArray.forEach((optionText, index) => {
          questionOptions.push({
            text: optionText,
            isCorrect: index === correctIndex
          });
        });
        
        questions.push({
          text: questionTexts[i],
          marks: parseInt(questionMarks[i]),
          options: questionOptions
        });
      }
    }
    
    // Calculate total marks from questions
    const calculatedTotalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    
    if (calculatedTotalMarks !== parseInt(totalMarks)) {
      req.flash('error_msg', 'Sum of question marks does not match total marks');
      return res.redirect(`/examinations/create/${courseId}`);
    }
    
    // Create examination
    const examination = new Examination({
      name,
      course: courseId,
      totalMarks: parseInt(totalMarks),
      passMarks: parseInt(passMarks),
      durationMinutes: parseInt(durationMinutes),
      questions,
      createdBy: req.user.id
    });
    
    await examination.save();
    
    req.flash('success_msg', 'Examination created successfully');
    res.redirect(`/courses/${courseId}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error creating examination');
    res.redirect(`/examinations/create/${req.body.courseId}`);
  }
});

// Show single examination
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const examination = await Examination.findById(req.params.id)
      .populate('course', 'name')
      .populate('createdBy', 'name');
    
    if (!examination) {
      req.flash('error_msg', 'Examination not found');
      return res.redirect('/courses');
    }
    
    // If user is member, check if course is assigned to them
    if (req.user.role === 'member') {
      const assignment = await CourseAssignment.findOne({
        course: examination.course._id,
        member: req.user.id
      });
      
      if (!assignment) {
        req.flash('error_msg', 'Not authorized to access this examination');
        return res.redirect('/courses');
      }
      
      // Check if exam is already taken
      const existingResult = await ExamResult.findOne({
        examination: examination._id,
        member: req.user.id,
        status: { $in: ['completed', 'auto-submitted'] }
      });
      
      if (existingResult) {
        return res.redirect(`/results/${existingResult._id}`);
      }
    }
    
    // Hide correct answers for members
    let examinationData = examination;
    if (req.user.role === 'member') {
      examinationData = examination.toObject();
      examinationData.questions = examinationData.questions.map(question => {
        question.options = question.options.map(option => {
          const { isCorrect, ...rest } = option;
          return rest;
        });
        return question;
      });
    }
    
    res.render('pages/examinations/show', {
      title: examination.name,
      examination: examinationData,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching examination');
    res.redirect('/courses');
  }
});

// Start examination
router.get('/:id/start', ensureAuthenticated, ensureMember, async (req, res) => {
  try {
    const examination = await Examination.findById(req.params.id)
      .populate('course', 'name');
    
    if (!examination) {
      req.flash('error_msg', 'Examination not found');
      return res.redirect('/courses');
    }
    
    // Check if course is assigned to member
    const assignment = await CourseAssignment.findOne({
      course: examination.course._id,
      member: req.user.id
    });
    
    if (!assignment) {
      req.flash('error_msg', 'Not authorized to take this examination');
      return res.redirect('/courses');
    }
    
    // Check if exam is already in progress
    let examResult = await ExamResult.findOne({
      examination: examination._id,
      member: req.user.id,
      status: 'in-progress'
    });
    
    // Check if exam is already completed
    const completedResult = await ExamResult.findOne({
      examination: examination._id,
      member: req.user.id,
      status: { $in: ['completed', 'auto-submitted'] }
    });
    
    if (completedResult) {
      req.flash('error_msg', 'You have already completed this examination');
      return res.redirect(`/results/${completedResult._id}`);
    }
    
    // Create new exam result if not already in progress
    if (!examResult) {
      examResult = new ExamResult({
        examination: examination._id,
        course: examination.course._id,
        member: req.user.id,
        startTime: Date.now(),
        status: 'in-progress'
      });
      
      await examResult.save();
    }
    
    // Hide correct answers
    const examinationData = examination.toObject();
    examinationData.questions = examinationData.questions.map(question => {
      question.options = question.options.map(option => {
        const { isCorrect, ...rest } = option;
        return rest;
      });
      return question;
    });
    
    res.render('pages/examinations/take', {
      title: `Taking: ${examination.name}`,
      examination: examinationData,
      examResult,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error starting examination');
    res.redirect(`/examinations/${req.params.id}`);
  }
});

// Submit examination
router.post('/:id/submit', ensureAuthenticated, ensureMember, submitExaminationValidation, async (req, res) => {
  try {
    const { examResultId, answers } = req.body;
    
    // Find the exam result
    const examResult = await ExamResult.findById(examResultId);
    
    if (!examResult) {
      req.flash('error_msg', 'Exam result not found');
      return res.redirect('/courses');
    }
    
    // Check if this exam belongs to the user
    if (examResult.member.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized to submit this examination');
      return res.redirect('/courses');
    }
    
    // Check if exam is still in progress
    if (examResult.status !== 'in-progress') {
      req.flash('error_msg', 'Examination is not in progress');
      return res.redirect(`/results/${examResult._id}`);
    }
    
    // Get the examination
    const examination = await Examination.findById(examResult.examination);
    
    if (!examination) {
      req.flash('error_msg', 'Examination not found');
      return res.redirect('/courses');
    }
    
    // Process answers and calculate score
    const processedAnswers = [];
    let totalMarksObtained = 0;
    
    examination.questions.forEach(question => {
      const answer = answers[question._id];
      const selectedOption = question.options.id(answer);
      const isCorrect = selectedOption && selectedOption.isCorrect;
      
      const marksObtained = isCorrect ? question.marks : 0;
      totalMarksObtained += marksObtained;
      
      processedAnswers.push({
        question: question._id,
        selectedOption: answer,
        isCorrect,
        marksObtained
      });
    });
    
    // Update exam result
    examResult.answers = processedAnswers;
    examResult.totalMarksObtained = totalMarksObtained;
    examResult.isPassed = totalMarksObtained >= examination.passMarks;
    examResult.endTime = Date.now();
    examResult.status = 'completed';
    
    await examResult.save();
    
    req.flash('success_msg', 'Examination submitted successfully');
    res.redirect(`/results/${examResult._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error submitting examination');
    res.redirect(`/examinations/${req.params.id}/start`);
  }
});

module.exports = router;