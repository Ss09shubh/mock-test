const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser
app.use(cookieParser());

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Debug middleware for form submissions
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    if (req.method === 'POST') {
      console.log('Form submission:', {
        url: req.originalUrl,
        body: req.body
      });
    }
    next();
  });
}

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount API routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/examinations', require('./routes/examinations'));
app.use('/api/results', require('./routes/results'));

// Mount web routes
app.use('/', require('./routes/web/index'));
app.use('/auth', require('./routes/web/auth'));
app.use('/dashboard', require('./routes/web/dashboard'));
app.use('/courses', require('./routes/web/courses'));
app.use('/examinations', require('./routes/web/examinations'));
app.use('/results', require('./routes/web/results'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
  
  req.flash('error_msg', 'Something went wrong: ' + (process.env.NODE_ENV === 'development' ? err.message : 'Server error'));
  res.redirect('/');
});

// Handle 404 errors
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  }
  
  res.status(404).render('pages/error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist',
    user: req.user
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});