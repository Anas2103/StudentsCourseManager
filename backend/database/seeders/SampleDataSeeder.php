<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAnnouncements();
        $this->seedAssignments();
        $this->seedGrades();
        $this->seedAttendance();
        $this->seedSchedules();
        $this->seedSubmissions();
    }

    private function seedSchedules(): void
    {
        $semesterId = \App\Models\Semester::where('is_current', true)->value('id');
        $rooms      = \App\Models\Classroom::pluck('id')->all();
        $days       = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        $slots      = [['08:30', '10:00'], ['10:15', '11:45'], ['13:30', '15:00'], ['15:15', '16:45']];

        foreach (Course::with('teachers')->get()->values() as $i => $course) {
            // Prefer the specialist assigned last (DemoUsersSeeder) over the generic demo teacher
            $teacher = $course->teachers->last();
            if (! $teacher) continue;

            // Two sessions per week. Every (day, slot) pair is used by exactly one course,
            // so no classroom or teacher is ever double-booked.
            $group = intdiv($i, 5) % 2;            // courses 0-4 -> slots 0/1, courses 5-9 -> slots 2/3
            $sessions = [
                [$i % 5, $group * 2],
                [($i + 2) % 5, $group * 2 + 1],
            ];
            foreach ($sessions as [$d, $slot]) {
                [$start, $end] = $slots[$slot];
                \App\Models\Schedule::create([
                    'course_id'    => $course->id,
                    'teacher_id'   => $teacher->id,
                    'classroom_id' => $rooms ? $rooms[$i % count($rooms)] : null,
                    'semester_id'  => $semesterId,
                    'day_of_week'  => $days[$d],
                    'start_time'   => $start,
                    'end_time'     => $end,
                ]);
            }
        }
    }

    private function seedSubmissions(): void
    {
        $feedback = [
            'Great work, clear and well structured.',
            'Good effort. Review the edge cases discussed in class.',
            'Solid understanding of the core concepts.',
            'Well done! Consider adding more examples next time.',
            'Meets the requirements. Pay attention to formatting.',
        ];

        foreach (Assignment::with('course')->get() as $assignment) {
            $studentIds = Enrollment::where('course_id', $assignment->course_id)
                ->where('status', 'approved')->pluck('student_id');

            foreach ($studentIds as $sid) {
                if (mt_rand(1, 100) > 75) continue; // ~75% submission rate

                $graded = mt_rand(1, 100) <= 70;
                $late   = mt_rand(1, 100) <= 15;
                $teacherUserId = Teacher::find($assignment->teacher_id)?->user_id;

                \App\Models\Submission::create([
                    'assignment_id' => $assignment->id,
                    'student_id'    => $sid,
                    'content'       => "Submission for \"{$assignment->title}\". Solutions and notes are included in the attached work.",
                    'submitted_at'  => now()->subDays(mt_rand(1, 10)),
                    'status'        => $graded ? 'graded' : ($late ? 'late' : 'submitted'),
                    'points_earned' => $graded ? (int) round($assignment->max_points * mt_rand(60, 100) / 100) : null,
                    'graded_at'     => $graded ? now()->subDays(mt_rand(0, 3)) : null,
                    'graded_by'     => $graded ? $teacherUserId : null,
                    'feedback'      => $graded ? $feedback[array_rand($feedback)] : null,
                ]);
            }
        }
    }

    private function seedAnnouncements(): void
    {
        $admin = User::whereHas('role', fn($q) => $q->where('name', 'super_admin'))->first();

        $announcements = [
            ['title' => 'Welcome to Spring Semester 2025', 'content' => 'Welcome back students! We hope you had a wonderful break. This semester will be filled with exciting courses and activities.', 'target_role' => 'all'],
            ['title' => 'Exam Schedule Released',          'content' => 'The final exam schedule for Spring 2025 has been released. Please check your individual course pages for exam dates and times.', 'target_role' => 'student'],
            ['title' => 'Faculty Meeting - March 15',      'content' => 'All faculty members are required to attend the departmental meeting on March 15th at 2:00 PM in Conference Room A.', 'target_role' => 'teacher'],
            ['title' => 'Library Extended Hours',          'content' => 'The university library will be open extended hours during exam week (May 20-31). Hours: 8 AM - 11 PM daily.', 'target_role' => 'all'],
            ['title' => 'Scholarship Applications Open',   'content' => 'Applications for the merit scholarship are now open. Eligible students must maintain a GPA of 3.5 or higher.', 'target_role' => 'student'],
        ];

        foreach ($announcements as $a) {
            Announcement::create([
                'user_id'      => $admin->id,
                'title'        => $a['title'],
                'content'      => $a['content'],
                'target_role'  => $a['target_role'],
                'is_active'    => true,
                'published_at' => now()->subDays(rand(1, 30)),
            ]);
        }
    }

    private function seedAssignments(): void
    {
        $courses  = Course::all();
        $teachers = Teacher::all();

        foreach ($courses->take(5) as $course) {
            $teacher = $course->teachers->first() ?? $teachers->first();
            if (! $teacher) continue;

            Assignment::create([
                'course_id'   => $course->id,
                'teacher_id'  => $teacher->id,
                'title'       => "Assignment 1: {$course->name} Basics",
                'description' => "Complete the introductory exercises for {$course->name}.",
                'due_date'    => now()->addDays(rand(7, 30)),
                'max_points'  => 100,
                'type'        => 'homework',
                'status'      => 'active',
            ]);

            Assignment::create([
                'course_id'   => $course->id,
                'teacher_id'  => $teacher->id,
                'title'       => "Midterm Project: {$course->name}",
                'description' => "Submit your midterm project demonstrating course concepts.",
                'due_date'    => now()->addDays(rand(30, 60)),
                'max_points'  => 200,
                'type'        => 'project',
                'status'      => 'active',
            ]);
        }
    }

    private function seedGrades(): void
    {
        $enrollments = Enrollment::where('status', 'approved')->with('student', 'course')->get();

        foreach ($enrollments as $enrollment) {
            $midterm    = rand(50, 100);
            $final      = rand(50, 100);
            $assignments = rand(60, 100);
            $attendance  = rand(70, 100);
            $total       = $midterm * 0.3 + $final * 0.4 + $assignments * 0.2 + $attendance * 0.1;

            Grade::firstOrCreate(
                ['student_id' => $enrollment->student_id, 'course_id' => $enrollment->course_id],
                [
                    'enrollment_id'     => $enrollment->id,
                    'midterm_score'     => $midterm,
                    'final_score'       => $final,
                    'assignments_score' => $assignments,
                    'attendance_score'  => $attendance,
                    'total_score'       => round($total, 2),
                    'grade_letter'      => \App\Models\Grade::calculateLetterGrade($total),
                    'gpa_points'        => \App\Models\Grade::calculateGpaPoints(
                        \App\Models\Grade::calculateLetterGrade($total)
                    ),
                ]
            );
        }
    }

    private function seedAttendance(): void
    {
        $enrollments = Enrollment::where('status', 'approved')->with('student', 'course')->get();
        $admin       = User::whereHas('role', fn($q) => $q->where('name', 'super_admin'))->first();
        $statuses    = ['present', 'present', 'present', 'present', 'absent', 'late']; // biased toward present

        // Seed last 30 days of attendance
        for ($day = 30; $day >= 1; $day--) {
            $date = now()->subDays($day)->toDateString();

            // Skip weekends
            if (in_array(now()->subDays($day)->dayOfWeek, [0, 6])) continue;

            foreach ($enrollments->take(30) as $enrollment) {
                // whereDate: the 'date' cast stores a full datetime, so a plain equality lookup misses
                $exists = Attendance::where('course_id', $enrollment->course_id)
                    ->where('student_id', $enrollment->student_id)
                    ->whereDate('date', $date)
                    ->exists();
                if ($exists) continue;

                Attendance::create([
                    'course_id'  => $enrollment->course_id,
                    'student_id' => $enrollment->student_id,
                    'date'       => $date,
                    'status'     => $statuses[array_rand($statuses)],
                    'created_by' => $admin->id,
                ]);
            }
        }
    }
}
