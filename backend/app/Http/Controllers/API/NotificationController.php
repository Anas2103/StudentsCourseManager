<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\AuditLog;
use App\Models\Enrollment;
use App\Models\Grade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $notifications = [];

        if ($user->isStudent() && $student = $user->student) {
            $notifications = $this->studentNotifications($student);
        } elseif ($user->isTeacher() && $teacher = $user->teacher) {
            $notifications = $this->teacherNotifications($teacher);
        } else {
            $notifications = $this->adminNotifications();
        }

        return response()->json(['notifications' => $notifications]);
    }

    private function adminNotifications(): array
    {
        $items = [];

        // Pending enrollment requests (high priority)
        $pending = Enrollment::where('status', 'pending')->count();
        if ($pending > 0) {
            $items[] = [
                'id'         => 'pending_enrollments',
                'type'       => 'enrollment_pending',
                'icon'       => 'clock',
                'color'      => 'orange',
                'title'      => 'Pending Enrollments',
                'message'    => "{$pending} enrollment request" . ($pending > 1 ? 's' : '') . " waiting for approval",
                'link'       => '/students',
                'created_at' => now()->toISOString(),
            ];
        }

        // Individual pending requests
        $recentPending = Enrollment::with('student.user', 'course')
            ->where('status', 'pending')
            ->latest()
            ->limit(5)
            ->get();

        foreach ($recentPending as $e) {
            $items[] = [
                'id'         => "enrollment_{$e->id}",
                'type'       => 'enrollment_request',
                'icon'       => 'user-plus',
                'color'      => 'blue',
                'title'      => 'Enrollment Request',
                'message'    => ($e->student->user->name ?? 'A student') . " wants to join " . ($e->course->name ?? 'a course'),
                'link'       => '/students/' . $e->student_id,
                'created_at' => $e->created_at->toISOString(),
            ];
        }

        // Recent activity from audit log
        $logs = AuditLog::with('user:id,name')
            ->where('created_at', '>=', now()->subDays(1))
            ->latest()
            ->limit(5)
            ->get();

        foreach ($logs as $log) {
            $items[] = [
                'id'         => "audit_{$log->id}",
                'type'       => 'audit',
                'icon'       => 'info',
                'color'      => 'gray',
                'title'      => 'System Activity',
                'message'    => $log->description ?? 'Action performed',
                'link'       => '/dashboard',
                'created_at' => $log->created_at->toISOString(),
            ];
        }

        // Recent announcements
        $recentAnnouncements = Announcement::where('is_active', true)
            ->where('created_at', '>=', now()->subDays(3))
            ->latest()
            ->limit(3)
            ->get();

        foreach ($recentAnnouncements as $a) {
            $items[] = [
                'id'         => "announcement_{$a->id}",
                'type'       => 'announcement',
                'icon'       => 'megaphone',
                'color'      => 'purple',
                'title'      => 'Announcement',
                'message'    => $a->title,
                'link'       => '/announcements',
                'created_at' => $a->created_at->toISOString(),
            ];
        }

        // Recent approved enrollments
        $recentApproved = Enrollment::with('student.user', 'course')
            ->where('status', 'approved')
            ->where('approved_at', '>=', now()->subDays(1))
            ->latest('approved_at')
            ->limit(3)
            ->get();

        foreach ($recentApproved as $e) {
            $items[] = [
                'id'         => "approved_{$e->id}",
                'type'       => 'enrollment_approved',
                'icon'       => 'check-circle',
                'color'      => 'green',
                'title'      => 'Enrollment Approved',
                'message'    => ($e->student->user->name ?? 'A student') . " approved in " . ($e->course->name ?? 'a course'),
                'link'       => '/students/' . $e->student_id,
                'created_at' => $e->approved_at->toISOString(),
            ];
        }

        return $this->sortByTime($items);
    }

    private function teacherNotifications($teacher): array
    {
        $items = [];
        $courseIds = $teacher->courses()->pluck('courses.id');

        $pendingGrades = Enrollment::whereIn('course_id', $courseIds)
            ->where('status', 'approved')
            ->whereDoesntHave('grade')
            ->count();

        if ($pendingGrades > 0) {
            $items[] = [
                'id'         => 'pending_grades',
                'type'       => 'grade_pending',
                'icon'       => 'clipboard',
                'color'      => 'red',
                'title'      => 'Grades Needed',
                'message'    => "{$pendingGrades} student" . ($pendingGrades > 1 ? 's' : '') . " still need grades",
                'link'       => '/grades',
                'created_at' => now()->toISOString(),
            ];
        }

        $upcoming = Assignment::whereIn('course_id', $courseIds)
            ->whereBetween('due_date', [now(), now()->addDays(7)])
            ->with('course:id,name,code')
            ->latest('due_date')
            ->limit(5)
            ->get();

        foreach ($upcoming as $a) {
            $daysLeft = (int) now()->diffInDays($a->due_date);
            $items[] = [
                'id'         => "assignment_{$a->id}",
                'type'       => 'assignment_due',
                'icon'       => 'calendar',
                'color'      => $daysLeft <= 1 ? 'red' : 'orange',
                'title'      => 'Assignment Due Soon',
                'message'    => "\"{$a->title}\" ({$a->course->code}) due in {$daysLeft} day" . ($daysLeft !== 1 ? 's' : ''),
                'link'       => '/assignments',
                'created_at' => $a->created_at->toISOString(),
            ];
        }

        $newEnrollments = Enrollment::whereIn('course_id', $courseIds)
            ->where('status', 'pending')
            ->with('student.user', 'course:id,name,code')
            ->latest()
            ->limit(5)
            ->get();

        foreach ($newEnrollments as $e) {
            $items[] = [
                'id'         => "enroll_{$e->id}",
                'type'       => 'enrollment_request',
                'icon'       => 'user-plus',
                'color'      => 'blue',
                'title'      => 'New Enrollment',
                'message'    => ($e->student->user->name ?? 'A student') . " joined " . ($e->course->code ?? ''),
                'link'       => '/courses',
                'created_at' => $e->created_at->toISOString(),
            ];
        }

        return $this->sortByTime($items);
    }

    private function studentNotifications($student): array
    {
        $items = [];

        $enrollments = Enrollment::where('student_id', $student->id)
            ->with('course:id,name,code')
            ->latest()
            ->limit(10)
            ->get();

        foreach ($enrollments as $e) {
            $statusMeta = match ($e->status) {
                'approved' => ['color' => 'green',  'title' => 'Enrollment Approved', 'icon' => 'check-circle'],
                'rejected' => ['color' => 'red',    'title' => 'Enrollment Rejected', 'icon' => 'x-circle'],
                'pending'  => ['color' => 'orange', 'title' => 'Enrollment Pending',  'icon' => 'clock'],
                default    => ['color' => 'gray',   'title' => 'Enrollment Update',   'icon' => 'info'],
            };
            $items[] = [
                'id'         => "enrollment_{$e->id}",
                'type'       => "enrollment_{$e->status}",
                'icon'       => $statusMeta['icon'],
                'color'      => $statusMeta['color'],
                'title'      => $statusMeta['title'],
                'message'    => "Your enrollment in " . ($e->course->name ?? 'a course') . " is {$e->status}",
                'link'       => '/courses',
                'created_at' => $e->updated_at->toISOString(),
            ];
        }

        $grades = Grade::where('student_id', $student->id)
            ->with('course:id,name,code')
            ->where('updated_at', '>=', now()->subDays(14))
            ->latest()
            ->limit(5)
            ->get();

        foreach ($grades as $g) {
            $items[] = [
                'id'         => "grade_{$g->id}",
                'type'       => 'grade_posted',
                'icon'       => 'award',
                'color'      => 'green',
                'title'      => 'Grade Posted',
                'message'    => "You received " . ($g->grade_letter ?? 'a grade') . " in " . ($g->course->name ?? 'a course'),
                'link'       => '/grades',
                'created_at' => $g->updated_at->toISOString(),
            ];
        }

        $courseIds = $student->enrollments()->where('status', 'approved')->pluck('course_id');
        $upcoming = Assignment::whereIn('course_id', $courseIds)
            ->whereBetween('due_date', [now(), now()->addDays(7)])
            ->with('course:id,name,code')
            ->latest('due_date')
            ->limit(5)
            ->get();

        foreach ($upcoming as $a) {
            $daysLeft = (int) now()->diffInDays($a->due_date);
            $items[] = [
                'id'         => "assignment_{$a->id}",
                'type'       => 'assignment_due',
                'icon'       => 'clipboard-list',
                'color'      => $daysLeft <= 1 ? 'red' : 'orange',
                'title'      => 'Assignment Due',
                'message'    => "\"{$a->title}\" due in {$daysLeft} day" . ($daysLeft !== 1 ? 's' : ''),
                'link'       => '/assignments',
                'created_at' => $a->created_at->toISOString(),
            ];
        }

        $announcements = Announcement::where('is_active', true)
            ->where(fn($q) => $q->where('target_role', 'all')->orWhere('target_role', 'student'))
            ->where('created_at', '>=', now()->subDays(7))
            ->latest()
            ->limit(3)
            ->get();

        foreach ($announcements as $a) {
            $items[] = [
                'id'         => "announcement_{$a->id}",
                'type'       => 'announcement',
                'icon'       => 'megaphone',
                'color'      => 'purple',
                'title'      => 'Announcement',
                'message'    => $a->title,
                'link'       => '/announcements',
                'created_at' => $a->created_at->toISOString(),
            ];
        }

        return $this->sortByTime($items);
    }

    private function sortByTime(array $items): array
    {
        usort($items, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
        return array_values(array_slice($items, 0, 20));
    }
}
