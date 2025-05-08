# Examination System

A Node.js application for managing online examinations with admin and member roles.

## Features

- User authentication with JWT
- Role-based access control (Admin and Member)
- Course management
- Examination creation and management
- Exam taking functionality
- Results tracking

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Swagger for API documentation

## Project Structure

```
examination-system/
├── config/
│   └── db.js
├── controllers/
│   ├── auth.js
│   ├── courses.js
│   ├── examinations.js
│   ├── results.js
│   └── users.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Course.js
│   ├── CourseAssignment.js
│   ├── ExamResult.js
│   ├── Examination.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── courses.js
│   ├── examinations.js
│   ├── results.js
│   └── users.js
├── .env
├── package.json
├── README.md
└── server.js
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/examination-system
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```
4. Start the server:
   ```
   npm start
   ```
   
## API Documentation

API documentation is available at `/api-docs` when the server is running.

## User Roles

### Admin
- Register and login
- Create members
- Create and manage courses
- Create examinations
- Assign courses to members
- View all examination results

### Member
- Login with credentials provided by admin
- View assigned courses
- Take examinations
- View own examination results

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `POST /api/users` - Create a new member (Admin only)
- `GET /api/users/members` - Get all members (Admin only)
- `GET /api/users/members/:id` - Get single member (Admin only)

### Courses
- `POST /api/courses` - Create a new course (Admin only)
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses/:id/assign` - Assign course to member (Admin only)
- `GET /api/courses/:courseId/examinations` - Get all examinations for a course

### Examinations
- `POST /api/examinations` - Create a new examination (Admin only)
- `GET /api/examinations/:id` - Get single examination
- `POST /api/examinations/:id/start` - Start an examination (Member only)
- `POST /api/examinations/:id/submit` - Submit examination answers (Member only)

### Results
- `GET /api/results` - Get all exam results
- `GET /api/results/:id` - Get single exam result
- `GET /api/results/member/:memberId` - Get results for a specific member (Admin only)
- `GET /api/results/course/:courseId` - Get results for a specific course (Admin only)