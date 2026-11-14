<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\StudentController;
use App\Http\Controllers\API\TeacherController;
use App\Http\Controllers\API\CourseController;
use App\Http\Controllers\API\DepartmentController;
use App\Http\Controllers\API\AssignmentController;
use App\Http\Controllers\API\SubmissionController;
use App\Http\Controllers\API\GradeController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\AnnouncementController;
use App\Http\Controllers\API\ScheduleController;
use App\Http\Controllers\API\EnrollmentController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\SemesterController;
use App\Http\Controllers\API\AcademicYearController;
use App\Http\Controllers\API\ClassroomController;
use App\Http\Controllers\API\AuditLogController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\SearchController;

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register',       [AuthController::class, 'register']);
    Route::post('/login',          [AuthController::class, 'login']);
    Route::post('/forgot-password',[AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes — require valid Sanctum token
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ----- Auth profile -----
    Route::prefix('auth')->group(function () {
        Route::post('/logout',          [AuthController::class, 'logout']);
        Route::get('/me',               [AuthController::class, 'me']);
        Route::put('/profile',          [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/upload-avatar',   [AuthController::class, 'uploadAvatar']);
    });

    // ----- Dashboard -----
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats',           [DashboardController::class, 'stats']);
        Route::get('/recent-activity', [DashboardController::class, 'recentActivity']);
        Route::get('/charts',          [DashboardController::class, 'charts']);
    });

    // ----- User management (super_admin, admin) -----
    Route::middleware('role:super_admin,admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::put('/users/{user}/toggle-status',  [UserController::class, 'toggleStatus']);
        Route::put('/users/{user}/reset-password', [UserController::class, 'resetUserPassword']);
        Route::put('/users/{user}/assign-role',    [UserController::class, 'assignRole']);
    });

    // ----- Departments -----
    Route::apiResource('departments', DepartmentController::class);

    // ----- Academic Years -----
    Route::apiResource('academic-years', AcademicYearController::class);

    // ----- Semesters -----
    Route::apiResource('semesters', SemesterController::class);

    // ----- Classrooms -----
    Route::apiResource('classrooms', ClassroomController::class);

    // ----- Students -----
    Route::apiResource('students', StudentController::class);
    Route::get('/students/{student}/courses',    [StudentController::class, 'courses']);
    Route::get('/students/{student}/grades',     [StudentController::class, 'grades']);
    Route::get('/students/{student}/attendance', [StudentController::class, 'attendance']);

    // ----- Teachers -----
    Route::apiResource('teachers', TeacherController::class)->except(['store']); // teachers are created via /users
    Route::get('/teachers/{teacher}/courses', [TeacherController::class, 'courses']);

    // ----- Courses -----
    Route::apiResource('courses', CourseController::class);
    Route::put('/courses/{course}/assign-teacher', [CourseController::class, 'assignTeacher']);
    Route::get('/courses/{course}/students',       [CourseController::class, 'students']);
    Route::get('/courses/{course}/assignments',    [CourseController::class, 'assignments']);
    Route::post('/courses/{course}/upload-material', [CourseController::class, 'uploadMaterial']);

    // ----- Enrollments -----
    Route::apiResource('enrollments', EnrollmentController::class)->except(['update']); // status changes via approve/reject
    Route::put('/enrollments/{enrollment}/approve', [EnrollmentController::class, 'approve']);
    Route::put('/enrollments/{enrollment}/reject',  [EnrollmentController::class, 'reject']);

    // ----- Assignments -----
    Route::apiResource('assignments', AssignmentController::class);
    Route::get('/assignments/{assignment}/submissions', [AssignmentController::class, 'submissions']);
    Route::post('/assignments/{assignment}/upload',     [AssignmentController::class, 'uploadFile']);

    // ----- Submissions -----
    Route::apiResource('submissions', SubmissionController::class)->except(['update']); // grading via /submissions/{id}/grade
    Route::put('/submissions/{submission}/grade', [SubmissionController::class, 'gradeSubmission']);

    // ----- Grades -----
    Route::apiResource('grades', GradeController::class);
    Route::get('/grades/course/{course}',   [GradeController::class, 'byCourse']);
    Route::get('/grades/student/{student}', [GradeController::class, 'byStudent']);

    // ----- Attendance -----
    Route::apiResource('attendance', AttendanceController::class);
    Route::post('/attendance/bulk',              [AttendanceController::class, 'bulkStore']);
    Route::get('/attendance/course/{course}',    [AttendanceController::class, 'byCourse']);
    Route::get('/attendance/student/{student}',  [AttendanceController::class, 'byStudent']);

    // ----- Announcements -----
    Route::apiResource('announcements', AnnouncementController::class);

    // ----- Schedules -----
    Route::apiResource('schedules', ScheduleController::class);
    Route::get('/schedules/course/{course}', [ScheduleController::class, 'byCourse']);

    // ----- Notifications -----
    Route::get('/notifications', [NotificationController::class, 'index']);

    // ----- Search -----
    Route::get('/search', [SearchController::class, 'index']);

    // ----- Audit Logs (super_admin only) -----
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });
});
