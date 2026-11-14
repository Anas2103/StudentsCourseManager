<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $depts    = Department::pluck('id', 'code');
        $semester = Semester::where('is_current', true)->first();
        $year     = \App\Models\AcademicYear::where('is_current', true)->first();

        $courses = [
            ['code' => 'CS101',   'name' => 'Introduction to Programming',  'dept' => 'CS',   'credits' => 3, 'max' => 35],
            ['code' => 'CS201',   'name' => 'Data Structures & Algorithms',  'dept' => 'CS',   'credits' => 3, 'max' => 30],
            ['code' => 'CS301',   'name' => 'Database Systems',              'dept' => 'CS',   'credits' => 3, 'max' => 30],
            ['code' => 'CS401',   'name' => 'Machine Learning',              'dept' => 'CS',   'credits' => 4, 'max' => 25],
            ['code' => 'MATH101', 'name' => 'Calculus I',                    'dept' => 'MATH', 'credits' => 4, 'max' => 40],
            ['code' => 'MATH201', 'name' => 'Linear Algebra',                'dept' => 'MATH', 'credits' => 3, 'max' => 35],
            ['code' => 'PHY101',  'name' => 'Classical Mechanics',           'dept' => 'PHY',  'credits' => 4, 'max' => 40],
            ['code' => 'BUS101',  'name' => 'Principles of Management',      'dept' => 'BUS',  'credits' => 3, 'max' => 50],
            ['code' => 'ENG101',  'name' => 'Academic Writing',              'dept' => 'ENG',  'credits' => 3, 'max' => 30],
            ['code' => 'CS501',   'name' => 'Software Engineering',          'dept' => 'CS',   'credits' => 3, 'max' => 25],
        ];

        $teachers = Teacher::all();

        foreach ($courses as $i => $c) {
            $course = Course::firstOrCreate(['code' => $c['code']], [
                'code'             => $c['code'],
                'name'             => $c['name'],
                'description'      => "This course covers the fundamentals of {$c['name']}.",
                'credits'          => $c['credits'],
                'department_id'    => $depts[$c['dept']] ?? null,
                'semester_id'      => $semester?->id,
                'academic_year_id' => $year?->id,
                'max_students'     => $c['max'],
                'status'           => 'active',
            ]);

            // Assign a teacher (cycle through available teachers)
            $teacher = $teachers->get($i % $teachers->count());
            if ($teacher) {
                $course->teachers()->syncWithoutDetaching([$teacher->id => ['is_primary' => true]]);
            }
        }

        // No enrollments seeded — users will enroll students through the app
    }
}
