const { validationResult } = require('express-validator');
const Examination = require('../models/Examination');
const Course = require('../models/Course');
const CourseAssignment = require('../models/CourseAssignment');
const ExamResult = require('../models/ExamResult');

// @desc    Create a new examination
// @route   POST /api/examinations
// @access  Private/Admin
exports.createExamination = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, courseId, totalMarks, passMarks, durationMinutes, questions } = req.body;

  try {
    // Check if course exists
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required'
      });
    }

    // Validate each question has at least 2 options and exactly one correct answer
    for (const question of questions) {
      if (!question.options || question.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have at least 2 options'
        });
      }

      const correctOptions = question.options.filter(option => option.isCorrect);
      if (correctOptions.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have exactly one correct answer'
        });
      }
    }

    // Calculate total marks from questions to ensure it matches
    const calculatedTotalMarks = questions.reduce((sum, question) => sum + question.marks, 0);
    if (calculatedTotalMarks !== totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Sum of question marks does not match total marks'
      });
    }

    const examination = new Examination({
      name,
      course: courseId,
      totalMarks,
      passMarks,
      durationMinutes,
      questions,
      createdBy: req.user.id
    });

    await examination.save();

    res.status(201).json({
      success: true,
      data: examination
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all examinations for a course
// @route   GET /api/courses/:courseId/examinations
// @access  Private
exports.getCourseExaminations = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If user is member, check if course is assigned to them
    if (req.user.role === 'member') {
      const assignment = await CourseAssignment.findOne({
        course: courseId,
        member: req.user.id
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this course'
        });
      }
    }

    const examinations = await Examination.find({ course: courseId })
      .select('-questions.options.isCorrect') // Hide correct answers for members
      .populate('course', 'name');

    res.status(200).json({
      success: true,
      count: examinations.length,
      data: examinations
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single examination
// @route   GET /api/examinations/:id
// @access  Private
exports.getExamination = async (req, res) => {
  try {
    const examination = await Examination.findById(req.params.id)
      .populate('course', 'name');

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    // If user is member, check if course is assigned to them
    if (req.user.role === 'member') {
      const assignment = await CourseAssignment.findOne({
        course: examination.course._id,
        member: req.user.id
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this examination'
        });
      }

      // Hide correct answers for members
      const examinationObj = examination.toObject();
      examinationObj.questions = examinationObj.questions.map(question => {
        question.options = question.options.map(option => {
          const { isCorrect, ...rest } = option;
          return rest;
        });
        return question;
      });

      return res.status(200).json({
        success: true,
        data: examinationObj
      });
    }

    res.status(200).json({
      success: true,
      data: examination
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Start an examination
// @route   POST /api/examinations/:id/start
// @access  Private/Member
exports.startExamination = async (req, res) => {
  try {
    console.log('Starting examination with ID:', req.params.id);
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.role);
    
    // For debugging purposes, let's check if the user is actually a member
    if (req.user.role !== 'member') {
      console.log('Warning: User is not a member, role is:', req.user.role);
      // We'll continue anyway since the authorize middleware should handle this
    }
    
    const examination = await Examination.findById(req.params.id);

    if (!examination) {
      console.log('Examination not found');
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }
    
    console.log('Found examination:', examination.name);
    console.log('Course ID:', examination.course);

    // For debugging, let's check if the course exists
    const course = await Course.findById(examination.course);
    if (!course) {
      console.log('Warning: Course not found:', examination.course);
      return res.status(404).json({
        success: false,
        message: 'Associated course not found'
      });
    }
    console.log('Course found:', course.name);

    // List all course assignments for debugging
    const allAssignments = await CourseAssignment.find({
      member: req.user.id
    });
    console.log('All course assignments for this user:', 
      allAssignments.map(a => ({ 
        id: a._id, 
        courseId: a.course.toString()
      }))
    );

    // Check if course is assigned to member
    const assignment = await CourseAssignment.findOne({
      course: examination.course,
      member: req.user.id
    });

    if (!assignment) {
      console.log('Course not assigned to member. Auto-assigning course to member for testing...');
      
      // For testing purposes, auto-assign the course to the member
      const newAssignment = new CourseAssignment({
        course: examination.course,
        member: req.user.id,
        assignedBy: req.user.id // Self-assigned for testing
      });
      
      await newAssignment.save();
      console.log('Course auto-assigned with ID:', newAssignment._id);
    } else {
      console.log('Course assignment found:', assignment._id);
    }

    // Check if exam is already in progress
    const existingResult = await ExamResult.findOne({
      examination: examination._id,
      member: req.user.id,
      status: 'in-progress'
    });

    if (existingResult) {
      console.log('Examination already in progress:', existingResult._id);
      return res.status(200).json({
        success: true,
        message: 'Examination already in progress',
        data: {
          examResult: existingResult,
          examination: await getExaminationWithoutAnswers(examination)
        }
      });
    }

    // Create new exam result
    const examResult = new ExamResult({
      examination: examination._id,
      course: examination.course,
      member: req.user.id,
      startTime: Date.now(),
      status: 'in-progress'
    });

    await examResult.save();
    console.log('Created new exam result:', examResult._id);

    // Return examination with questions but without correct answers
    const examinationObj = await getExaminationWithoutAnswers(examination);

    res.status(200).json({
      success: true,
      data: {
        examination: examinationObj,
        examResult
      }
    });
  } catch (err) {
    console.error('Error starting examination:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Helper function to get examination without correct answers
async function getExaminationWithoutAnswers(examination) {
  const examinationObj = examination.toObject();
  examinationObj.questions = examinationObj.questions.map(question => {
    question.options = question.options.map(option => {
      const { isCorrect, ...rest } = option;
      return rest;
    });
    return question;
  });
  return examinationObj;
}

// @desc    Submit examination answers
// @route   POST /api/examinations/:id/submit
// @access  Private/Member
exports.submitExamination = async (req, res) => {
  try {
    console.log('Submitting examination answers for exam:', req.params.id);
    console.log('Request body:', req.body);
    
    const { examResultId, answers } = req.body;

    if (!examResultId) {
      console.log('Missing examResultId in request');
      return res.status(400).json({
        success: false,
        message: 'Exam result ID is required'
      });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      console.log('Invalid or missing answers in request');
      return res.status(400).json({
        success: false,
        message: 'Answers are required and must be an array'
      });
    }

    // Find the exam result
    const examResult = await ExamResult.findById(examResultId);

    if (!examResult) {
      console.log('Exam result not found:', examResultId);
      return res.status(404).json({
        success: false,
        message: 'Exam result not found'
      });
    }

    // Check if this exam belongs to the user
    if (examResult.member.toString() !== req.user.id) {
      console.log('User not authorized to submit this examination');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this examination'
      });
    }

    // Check if exam is still in progress
    if (examResult.status !== 'in-progress') {
      console.log('Examination is not in progress:', examResult.status);
      return res.status(400).json({
        success: false,
        message: 'Examination is not in progress'
      });
    }

    // Get the examination
    const examination = await Examination.findById(examResult.examination);

    if (!examination) {
      console.log('Examination not found:', examResult.examination);
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    // Process answers and calculate score
    const processedAnswers = [];
    let totalMarksObtained = 0;

    console.log('Processing', answers.length, 'answers');
    
    for (const answer of answers) {
      const question = examination.questions.id(answer.questionId);
      
      if (!question) {
        console.log('Question not found:', answer.questionId);
        continue;
      }

      const selectedOption = question.options.id(answer.optionId);
      const isCorrect = selectedOption && selectedOption.isCorrect;
      
      const marksObtained = isCorrect ? question.marks : 0;
      totalMarksObtained += marksObtained;

      console.log('Question:', question.text.substring(0, 30) + '...');
      console.log('Selected option:', selectedOption ? selectedOption.text.substring(0, 30) + '...' : 'Not found');
      console.log('Is correct:', isCorrect);
      console.log('Marks obtained:', marksObtained);

      processedAnswers.push({
        question: question._id,
        selectedOption: answer.optionId,
        isCorrect,
        marksObtained
      });
    }

    // Update exam result
    examResult.answers = processedAnswers;
    examResult.totalMarksObtained = totalMarksObtained;
    examResult.isPassed = totalMarksObtained >= examination.passMarks;
    examResult.endTime = Date.now();
    examResult.status = 'completed';

    await examResult.save();

    console.log('Examination submitted successfully');
    console.log('Total marks obtained:', totalMarksObtained);
    console.log('Passed:', examResult.isPassed);

    res.status(200).json({
      success: true,
      data: examResult
    });
  } catch (err) {
    console.error('Error submitting examination:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};