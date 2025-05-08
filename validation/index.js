const auth = require('./auth');
const user = require('./user');
const course = require('./course');
const examination = require('./examination');

// Middleware to handle validation with Joi
exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      // For web forms, we need to handle password confirmation differently
      let dataToValidate = req.body;
      
      // Special handling for registration form
      if (req.originalUrl === '/auth/register' && req.body.password2) {
        dataToValidate = {
          ...req.body,
          password2: req.body.password2
        };
      }
      
      const { error } = schema.validate(dataToValidate, { 
        abortEarly: false,
        stripUnknown: true // Ignore unknown fields
      });
      
      if (!error) {
        return next();
      }
      
      const errors = error.details.map(detail => ({
        param: detail.path.join('.'),
        msg: detail.message
      }));
      
      console.log('Validation errors:', errors); // Debug log
      
      // For API routes
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({ errors });
      }
      
      // For web routes
      req.flash('error_msg', errors[0].msg);
      
      // For registration form, preserve entered data
      if (req.originalUrl === '/auth/register') {
        return res.render('pages/auth/register', {
          title: 'Register',
          errors: errors,
          name: req.body.name,
          email: req.body.email,
          gender: req.body.gender,
          phone: req.body.phone
        });
      }
      
      // For login form, preserve email
      if (req.originalUrl === '/auth/login') {
        return res.render('pages/auth/login', {
          title: 'Login',
          errors: errors,
          email: req.body.email
        });
      }
      
      return res.redirect('back');
    } catch (err) {
      console.error('Validation error:', err);
      
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(500).json({ 
          errors: [{ msg: 'Server validation error' }] 
        });
      }
      
      req.flash('error_msg', 'An error occurred during form validation');
      return res.redirect('back');
    }
  };
};

// Export all validation schemas
module.exports = {
  registerValidation: exports.validate(auth.registerValidation),
  loginValidation: exports.validate(auth.loginValidation),
  createMemberValidation: exports.validate(user.createMemberValidation),
  updateMemberValidation: exports.validate(user.updateMemberValidation),
  createCourseValidation: exports.validate(course.createCourseValidation),
  assignCourseValidation: exports.validate(course.assignCourseValidation),
  createExaminationValidation: exports.validate(examination.createExaminationValidation),
  submitExaminationValidation: exports.validate(examination.submitExaminationValidation)
};