# Student Course Management System (SCMS)

A complete fullstack Student Course Management System built with **Laravel 11** (REST API) and **React 18 + Vite** (SPA frontend).

---

## Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Backend     | Laravel 11 + Sanctum           |
| Frontend    | React 18 + Vite 6              |
| Database    | SQLite (dev) / MySQL (prod)    |
| Styling     | Tailwind CSS 3                 |
| HTTP Client | Axios                          |
| Routing     | React Router v7                |
| State       | Context API                    |
| Charts      | Recharts                       |
| Icons       | Lucide React                   |
| Toasts      | React Hot Toast                |
| i18n        | react-i18next (EN / FR / AR)   |

---

## Roles

| Role        | Capabilities                                                         |
|-------------|----------------------------------------------------------------------|
| Super Admin | Full system access, user/role management, audit logs                 |
| Admin       | Manage students, teachers, courses, enrollments, announcements       |
| Teacher     | Manage own courses, grades, attendance, assignments, grade submissions|
| Student     | Browse & enroll in courses, submit assignments, view grades/transcript|

---

## Prerequisites

- PHP >= 8.2 with extensions: `pdo_sqlite`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`
- Composer >= 2.x
- Node.js >= 18.x + npm

---

## Installation

### 1. Backend Setup

```bash
cd StudentsCourseManager/backend

# Install PHP dependencies
composer install

# Copy and configure environment
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 2. Database Configuration

Edit `backend/.env` — for development, SQLite is pre-configured:

```env
DB_CONNECTION=sqlite
# DB_DATABASE is auto-resolved to database/database.sqlite

FRONTEND_URL=http://localhost:5173
```

> **MySQL (production):** Change `DB_CONNECTION=mysql` and add `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

### 3. Migrate & Seed

```bash
cd backend

# Run all 19 migrations
php artisan migrate

# Seed with realistic sample data
php artisan db:seed

# Or fresh migration + seed in one command
php artisan migrate:fresh --seed
```

### 4. Storage Link

```bash
php artisan storage:link
```

### 5. Start Backend

```bash
php artisan serve
# API available at http://localhost:8000
```

---

### 6. Frontend Setup

```bash
cd StudentsCourseManager/frontend

# Install Node dependencies
npm install

# Copy and configure environment
cp .env.example .env
```

`frontend/.env` should contain:

```env
VITE_API_URL=http://localhost:8000/api
```

### 7. Start Frontend

```bash
npm run dev
# App available at http://localhost:5173
```

---

## Test Credentials

All accounts use password: **`password`**

| Role        | Email                  |
|-------------|------------------------|
| Super Admin | superadmin@scms.com    |
| Admin       | admin@scms.com         |
| Teacher     | tanas1@scms.com        |
| Teacher     | tanas2@scms.com        |
| Student     | sanas1@scms.com        |
| Student     | sanas2@scms.com        |

> All accounts use password `password`. TAnas1–4 and SAnas1–8 are demo accounts with realistic grades, attendance, assignments, and submissions pre-loaded.

---

## Project Structure

```
StudentsCourseManager/
├── backend/                              # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/API/          # 18 controllers
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── UserController.php
│   │   │   │   ├── StudentController.php
│   │   │   │   ├── TeacherController.php
│   │   │   │   ├── CourseController.php
│   │   │   │   ├── EnrollmentController.php
│   │   │   │   ├── AssignmentController.php
│   │   │   │   ├── SubmissionController.php
│   │   │   │   ├── GradeController.php
│   │   │   │   ├── AttendanceController.php
│   │   │   │   ├── AnnouncementController.php
│   │   │   │   ├── ScheduleController.php
│   │   │   │   ├── DepartmentController.php
│   │   │   │   ├── SemesterController.php
│   │   │   │   ├── AcademicYearController.php
│   │   │   │   ├── ClassroomController.php
│   │   │   │   └── AuditLogController.php
│   │   │   ├── Middleware/
│   │   │   │   ├── RoleMiddleware.php
│   │   │   │   └── AuditLogMiddleware.php
│   │   │   ├── Requests/                 # Form validation
│   │   │   │   ├── Auth/
│   │   │   │   ├── User/
│   │   │   │   ├── Course/
│   │   │   │   └── Student/
│   │   │   └── Resources/               # 12 API transformers
│   │   ├── Models/                       # 18 Eloquent models
│   │   │   ├── Role.php
│   │   │   ├── User.php
│   │   │   ├── Student.php
│   │   │   ├── Teacher.php
│   │   │   ├── Admin.php
│   │   │   ├── Course.php
│   │   │   ├── Enrollment.php
│   │   │   ├── Assignment.php
│   │   │   ├── Submission.php
│   │   │   ├── Grade.php
│   │   │   ├── Attendance.php
│   │   │   ├── Announcement.php
│   │   │   ├── Schedule.php
│   │   │   ├── Department.php
│   │   │   ├── Classroom.php
│   │   │   ├── Semester.php
│   │   │   ├── AcademicYear.php
│   │   │   └── AuditLog.php
│   │   └── Providers/
│   │       └── AppServiceProvider.php
│   ├── bootstrap/
│   │   ├── app.php                       # Laravel 11 app config + middleware
│   │   └── providers.php
│   ├── config/cors.php
│   ├── database/
│   │   ├── migrations/                   # 19 migration files
│   │   └── seeders/                      # 8 seeders (roles → users → courses → sample data)
│   ├── public/index.php
│   ├── routes/
│   │   ├── api.php                       # All API routes
│   │   ├── web.php
│   │   └── console.php
│   ├── artisan
│   └── composer.json
│
└── frontend/                             # React 18 + Vite
    └── src/
        ├── api/
        │   ├── axios.js                  # Axios instance + interceptors
        │   └── index.js                  # All API service calls
        ├── components/common/
        │   ├── Avatar.jsx
        │   ├── Badge.jsx
        │   ├── ConfirmModal.jsx
        │   ├── EmptyState.jsx
        │   ├── LoadingSpinner.jsx
        │   ├── Modal.jsx
        │   ├── Navbar.jsx
        │   ├── PageHeader.jsx
        │   ├── Pagination.jsx
        │   ├── Sidebar.jsx
        │   └── StatsCard.jsx
        ├── contexts/
        │   └── AuthContext.jsx
        ├── layouts/
        │   ├── AuthLayout.jsx
        │   └── DashboardLayout.jsx
        ├── pages/
        │   ├── announcements/Announcements.jsx
        │   ├── assignments/Assignments.jsx
        │   ├── attendance/Attendance.jsx
        │   ├── auth/
        │   │   ├── ForgotPassword.jsx
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   ├── courses/
        │   │   ├── CourseDetail.jsx
        │   │   └── Courses.jsx
        │   ├── dashboard/Dashboard.jsx
        │   ├── grades/Grades.jsx
        │   ├── landing/Landing.jsx
        │   ├── profile/Profile.jsx
        │   ├── schedules/Schedules.jsx
        │   ├── students/
        │   │   ├── StudentDetail.jsx
        │   │   └── Students.jsx
        │   ├── teachers/Teachers.jsx
        │   └── users/Users.jsx
        ├── routes/
        │   └── ProtectedRoute.jsx
        └── utils/
            ├── constants.js
            └── helpers.js
```

---

## API Reference

All protected routes require header: `Authorization: Bearer {token}`

### Auth
| Method | Endpoint                  | Description                  |
|--------|---------------------------|------------------------------|
| POST   | /api/auth/register        | Register new student account |
| POST   | /api/auth/login           | Login, returns token         |
| POST   | /api/auth/logout          | Revoke token                 |
| GET    | /api/auth/me              | Get authenticated user       |
| PUT    | /api/auth/profile         | Update profile               |
| PUT    | /api/auth/password        | Change password              |
| POST   | /api/auth/avatar          | Upload avatar                |

### Dashboard
| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| GET    | /api/dashboard/stats        | KPI counts + role metrics    |
| GET    | /api/dashboard/recent       | Recent activity feed         |
| GET    | /api/dashboard/charts       | Chart data (6 datasets)      |

### Core Resources
| Method | Endpoint                          | Description                   |
|--------|-----------------------------------|-------------------------------|
| GET    | /api/users                        | List users (admin+)           |
| POST   | /api/users                        | Create user                   |
| GET/PUT/DELETE | /api/users/{id}          | Show/update/delete user       |
| GET    | /api/students                     | List students                 |
| GET    | /api/students/{id}                | Student detail                |
| GET    | /api/students/{id}/courses        | Student's enrolled courses    |
| GET    | /api/students/{id}/grades         | Student's grades              |
| GET    | /api/teachers                     | List teachers                 |
| GET    | /api/courses                      | List courses                  |
| POST   | /api/courses                      | Create course                 |
| GET    | /api/courses/{id}/students        | Enrolled students             |
| GET    | /api/courses/{id}/assignments     | Course assignments            |
| POST   | /api/courses/{id}/teachers        | Assign teacher                |
| GET    | /api/enrollments                  | List enrollments              |
| POST   | /api/enrollments                  | Enroll student                |
| PUT    | /api/enrollments/{id}/approve     | Approve enrollment            |
| PUT    | /api/enrollments/{id}/reject      | Reject enrollment             |
| GET    | /api/grades                       | List grades                   |
| POST   | /api/grades                       | Create/update grade           |
| GET    | /api/attendance                   | List attendance               |
| POST   | /api/attendance/bulk              | Bulk record attendance        |
| GET    | /api/assignments                  | List assignments              |
| GET    | /api/submissions                  | List submissions              |
| PUT    | /api/submissions/{id}/grade       | Grade a submission            |
| GET    | /api/announcements                | Role-filtered announcements   |
| GET    | /api/schedules                    | Role-filtered schedules       |
| GET    | /api/audit-logs                   | Audit trail (super admin)     |

---

## Grade Calculation

Grades are calculated using a weighted formula:

```
Total = (Midterm × 30%) + (Final × 40%) + (Assignments × 20%) + (Attendance × 10%)
```

| Score   | Grade | GPA  |
|---------|-------|------|
| ≥ 97    | A+    | 4.0  |
| ≥ 93    | A     | 4.0  |
| ≥ 90    | A-    | 3.7  |
| ≥ 87    | B+    | 3.3  |
| ≥ 83    | B     | 3.0  |
| ≥ 80    | B-    | 2.7  |
| ≥ 77    | C+    | 2.3  |
| ≥ 73    | C     | 2.0  |
| ≥ 70    | C-    | 1.7  |
| ≥ 67    | D+    | 1.3  |
| ≥ 65    | D     | 1.0  |
| < 65    | F     | 0.0  |

---

## Key Features

- **JWT-style token auth** via Laravel Sanctum (Bearer tokens in localStorage)
- **Role-based access control** with middleware protecting every route
- **Audit logging** — all write operations logged with before/after values
- **File uploads** — avatars (storage/avatars), assignment files, course materials
- **Soft deletes** on Users and Courses
- **Weighted grade system** with automatic letter grade and GPA point calculation
- **Paginated API responses** with search, filter, and sort on every list endpoint
- **Role-scoped data** — teachers see only their courses, students see only enrolled courses
- **Responsive dashboard** with Recharts (area, bar, pie charts)
- **Mobile-friendly sidebar** with collapse/overlay on small screens

---

## More projects

- [**CarsRental**](https://github.com/Anas2103/CarsRental) — car rental manager with roles and PayPal (Laravel · React)
- [**E-Commerce**](https://github.com/Anas2103/Ecommerce) — multi-vendor store with Stripe & PayPal (Laravel · React) · [live demo](https://anas2103-ecommerce.vercel.app)
- [**HireMatch**](https://github.com/Anas2103/AiJobBoard) — AI job board that scores CVs against jobs (Laravel · React · OpenAI)
- [**Relay**](https://github.com/Anas2103/Relay) — Telegram-style chat with E2EE secret chats and calls (Cloudflare Workers · React) · [live demo](https://relay-chat.bunbunchat.workers.dev)
- [**SmartCourse**](https://github.com/Anas2103/SmartCoursePlatform) — online course platform with Stripe and certificates (Laravel · React)

More about me on my [GitHub profile](https://github.com/Anas2103).
