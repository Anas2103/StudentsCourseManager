<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Assignment;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = [
            'total_students'         => Student::where('status', 'active')->count(),
            'total_teachers'         => Teacher::where('status', 'active')->count(),
            'total_courses'          => Course::where('status', 'active')->count(),
            'total_enrollments'      => Enrollment::where('status', 'approved')->count(),
            'pending_enrollments'    => Enrollment::where('status', 'pending')->count(),
            'average_attendance_pct' => $this->averageAttendance(),
            'average_gpa'            => round(Grade::avg('gpa_points') ?? 0, 2),
        ];

        if ($user->isStudent() && $student = $user->student) {
            $stats['my_courses']    = $student->enrollments()->where('status', 'approved')->count();
            $stats['my_gpa']        = round($student->grades()->avg('gpa_points') ?? 0, 2);
            $stats['my_attendance'] = $this->studentAttendancePct($student->id);
            $stats['pending_assignments'] = Assignment::whereIn(
                'course_id',
                $student->enrollments()->where('status', 'approved')->pluck('course_id')
            )->where('due_date', '>=', now())->count();
        }

        if ($user->isTeacher() && $teacher = $user->teacher) {
            $courseIds = $teacher->courses()->pluck('courses.id');
            $stats['my_courses']  = $courseIds->count();
            $stats['my_students'] = Enrollment::whereIn('course_id', $courseIds)
                                              ->where('status', 'approved')
                                              ->distinct('student_id')->count();
            $stats['pending_grades'] = Enrollment::whereIn('course_id', $courseIds)
                                                 ->where('status', 'approved')
                                                 ->whereDoesntHave('grade')
                                                 ->count();
            $stats['upcoming_assignments'] = Assignment::whereIn('course_id', $courseIds)
                                                       ->where('due_date', '>=', now())
                                                       ->count();
        }

        return response()->json(['stats' => $stats]);
    }

    public function recentActivity(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isStudent() && $student = $user->student) {
            $courseIds = $student->enrollments()->where('status', 'approved')->pluck('course_id');
            $announcements = Announcement::where('is_active', true)
                ->where(fn($q) => $q->where('target_role', 'all')->orWhere('target_role', 'student'))
                ->latest('published_at')->limit(5)->get();
            return response()->json(['activity' => [], 'announcements' => $announcements]);
        }

        $logs = AuditLog::with('user:id,name,avatar')->latest()->limit(15)->get();
        return response()->json(['activity' => $logs, 'announcements' => []]);
    }

    public function charts(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isStudent() && $student = $user->student) {
            return $this->studentCharts($student);
        }

        if ($user->isTeacher() && $teacher = $user->teacher) {
            return $this->teacherCharts($teacher);
        }

        return $this->adminCharts();
    }

    // ---- Admin / Super Admin charts ----
    private function adminCharts(): JsonResponse
    {
        $enrollmentsByMonth = Enrollment::selectRaw("strftime('%Y-%m', created_at) as month, COUNT(*) as total")
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')->orderBy('month')->get();

        $gradeDistribution = Grade::selectRaw('grade_letter, COUNT(*) as total')
            ->whereNotNull('grade_letter')->groupBy('grade_letter')->orderBy('grade_letter')->get();

        $attendanceDistribution = Attendance::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')->get();

        $topCourses = Course::withCount(['enrollments as approved_count' => fn($q) => $q->where('status', 'approved')])
            ->orderByDesc('approved_count')->limit(5)->get(['id', 'name', 'code']);

        return response()->json([
            'role'                    => 'admin',
            'enrollments_by_month'    => $enrollmentsByMonth,
            'grade_distribution'      => $gradeDistribution,
            'attendance_distribution' => $attendanceDistribution,
            'top_courses'             => $topCourses,
        ]);
    }

    // ---- Teacher charts ----
    private function teacherCharts($teacher): JsonResponse
    {
        $courseIds = $teacher->courses()->pluck('courses.id');

        $gradeDistribution = Grade::whereIn('course_id', $courseIds)
            ->selectRaw('grade_letter, COUNT(*) as total')
            ->whereNotNull('grade_letter')->groupBy('grade_letter')->orderBy('grade_letter')->get();

        $attendanceByCourse = Course::whereIn('id', $courseIds)
            ->withCount([
                'attendance as present_count' => fn($q) => $q->whereIn('status', ['present', 'late']),
                'attendance as absent_count'  => fn($q) => $q->where('status', 'absent'),
            ])
            ->get(['id', 'name', 'code']);

        $enrollmentByCourse = Course::whereIn('id', $courseIds)
            ->withCount(['enrollments as approved_count' => fn($q) => $q->where('status', 'approved')])
            ->get(['id', 'name', 'code']);

        return response()->json([
            'role'                  => 'teacher',
            'grade_distribution'    => $gradeDistribution,
            'attendance_by_course'  => $attendanceByCourse,
            'enrollment_by_course'  => $enrollmentByCourse,
        ]);
    }

    // ---- Student charts ----
    private function studentCharts($student): JsonResponse
    {
        $grades = Grade::where('student_id', $student->id)
            ->with('course:id,name,code')
            ->get(['id', 'course_id', 'total_score', 'grade_letter', 'gpa_points']);

        $attendance = Attendance::where('student_id', $student->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')->get();

        $gradesByCourse = $grades->map(fn($g) => [
            'course' => $g->course?->code ?? '—',
            'score'  => $g->total_score ?? 0,
            'letter' => $g->grade_letter,
        ])->values();

        return response()->json([
            'role'             => 'student',
            'grades_by_course' => $gradesByCourse,
            'attendance'       => $attendance,
        ]);
    }

    private function averageAttendance(): float
    {
        $total   = Attendance::count();
        $present = Attendance::whereIn('status', ['present', 'late'])->count();
        return $total > 0 ? round(($present / $total) * 100, 1) : 0;
    }

    private function studentAttendancePct(int $studentId): float
    {
        $total   = Attendance::where('student_id', $studentId)->count();
        $present = Attendance::where('student_id', $studentId)->whereIn('status', ['present', 'late'])->count();
        return $total > 0 ? round(($present / $total) * 100, 1) : 0;
    }
}
