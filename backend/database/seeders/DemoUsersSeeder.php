<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Role;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Models\AcademicYear;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $roles   = Role::pluck('id', 'name');
        $depts   = Department::pluck('id', 'code');
        $sem     = Semester::where('is_current', true)->first();
        $year    = AcademicYear::where('is_current', true)->first();
        $admin   = User::whereHas('role', fn($q) => $q->where('name', 'super_admin'))->first();

        // ─────────────────────────────────────────────
        // TEACHERS
        // ─────────────────────────────────────────────
        $teacherDefs = [
            ['Dr. Karim Benali', 'tanas1@scms.com', 'TCH-0002', 'CS',   'PhD Computer Science',    'Database Systems',     7,  'male'],
            ['Dr. Sara El Idrissi', 'tanas2@scms.com', 'TCH-0003', 'MATH', 'PhD Mathematics',          'Calculus & Analysis',  12, 'male'],
            ['Prof. Laila Haddad', 'tanas3@scms.com', 'TCH-0004', 'PHY',  'MSc Physics',              'Classical Mechanics',  5,  'female'],
            ['Mr. Omar Tazi', 'tanas4@scms.com', 'TCH-0005', 'BUS',  'MBA',                      'Business Management',  9,  'male'],
        ];

        $teachers = [];
        foreach ($teacherDefs as [$name, $email, $tid, $dept, $qual, $spec, $exp, $gender]) {
            $user = User::firstOrCreate(['email' => $email], [
                'name'     => $name,
                'password' => Hash::make('password'),
                'role_id'  => $roles['teacher'],
                'status'   => 'active',
            ]);
            $teacher = Teacher::firstOrCreate(['user_id' => $user->id], [
                'teacher_id'       => $tid,
                'department_id'    => $depts[$dept] ?? null,
                'qualification'    => $qual,
                'specialization'   => $spec,
                'experience_years' => $exp,
                'join_date'        => now()->subYears(rand(2, 8))->toDateString(),
                'status'           => 'active',
            ]);
            $teachers[$name] = $teacher;
        }

        // ─────────────────────────────────────────────
        // ASSIGN TEACHERS TO COURSES
        // ─────────────────────────────────────────────
        $courseTeacherMap = [
            'CS301'   => 'Dr. Karim Benali',
            'CS501'   => 'Dr. Karim Benali',
            'MATH101' => 'Dr. Sara El Idrissi',
            'MATH201' => 'Dr. Sara El Idrissi',
            'PHY101'  => 'Prof. Laila Haddad',
            'BUS101'  => 'Mr. Omar Tazi',
            'ENG101'  => 'Mr. Omar Tazi',
        ];
        foreach ($courseTeacherMap as $code => $tname) {
            $course  = Course::where('code', $code)->first();
            $teacher = $teachers[$tname];
            if ($course && $teacher) {
                $course->teachers()->syncWithoutDetaching([$teacher->id => ['is_primary' => false]]);
            }
        }

        // ─────────────────────────────────────────────
        // STUDENTS
        // ─────────────────────────────────────────────
        $studentDefs = [
            //  name     email              stu_id     dept    gender  dob
            ['Yassine Amrani', 'sanas1@scms.com', 'STU-0002', 'CS',   'male',   '2002-03-14'],
            ['Salma Bennani', 'sanas2@scms.com', 'STU-0003', 'CS',   'female', '2003-07-22'],
            ['Mehdi Alaoui', 'sanas3@scms.com', 'STU-0004', 'MATH', 'male',   '2002-11-05'],
            ['Hamza Cherkaoui', 'sanas4@scms.com', 'STU-0005', 'CS',   'male',   '2001-09-18'],
            ['Imane Fassi', 'sanas5@scms.com', 'STU-0006', 'PHY',  'female', '2003-04-30'],
            ['Adam Berrada', 'sanas6@scms.com', 'STU-0007', 'BUS',  'male',   '2002-01-08'],
            ['Nora Ziani', 'sanas7@scms.com', 'STU-0008', 'CS',   'female', '2003-06-17'],
            ['Rayan Lahlou', 'sanas8@scms.com', 'STU-0009', 'ENG',  'male',   '2002-12-25'],
        ];

        $students = [];
        foreach ($studentDefs as [$name, $email, $sid, $dept, $gender, $dob]) {
            $user = User::firstOrCreate(['email' => $email], [
                'name'     => $name,
                'password' => Hash::make('password'),
                'role_id'  => $roles['student'],
                'status'   => 'active',
            ]);
            $student = Student::firstOrCreate(['user_id' => $user->id], [
                'student_id'       => $sid,
                'department_id'    => $depts[$dept] ?? null,
                'semester_id'      => $sem?->id,
                'academic_year_id' => $year?->id,
                'date_of_birth'    => $dob,
                'gender'           => $gender,
                'enrollment_date'  => now()->subMonths(rand(4, 10))->toDateString(),
                'status'           => 'active',
            ]);
            $students[$name] = $student;
        }

        // Include the primary demo student (student1@scms.com) so their dashboard has data
        $demoStudent = Student::where('student_id', 'STU-0001')->first();
        if ($demoStudent) {
            $students['Alice Cooper'] = $demoStudent;
        }

        // ─────────────────────────────────────────────
        // ENROLLMENTS
        // ─────────────────────────────────────────────
        // Each student gets 3–5 courses, all approved
        $enrollmentMap = [
            'Yassine Amrani' => ['CS101', 'CS201', 'MATH101', 'ENG101'],
            'Salma Bennani' => ['CS101', 'CS301', 'CS501', 'MATH201'],
            'Mehdi Alaoui' => ['MATH101', 'MATH201', 'PHY101', 'CS101'],
            'Hamza Cherkaoui' => ['CS201', 'CS401', 'CS301', 'BUS101'],
            'Imane Fassi' => ['PHY101', 'MATH101', 'ENG101'],
            'Adam Berrada' => ['BUS101', 'ENG101', 'MATH101'],
            'Nora Ziani' => ['CS101', 'CS201', 'CS401', 'CS501'],
            'Rayan Lahlou' => ['ENG101', 'BUS101', 'MATH101'],
            'Alice Cooper' => ['CS101', 'CS201', 'CS301', 'MATH101', 'ENG101'],
        ];
        $enrollmentMap = array_intersect_key($enrollmentMap, $students);

        $enrollments = [];
        foreach ($enrollmentMap as $sname => $codes) {
            $student = $students[$sname];
            foreach ($codes as $code) {
                $course = Course::where('code', $code)->first();
                if (!$course) continue;

                $enrollment = Enrollment::firstOrCreate(
                    ['student_id' => $student->id, 'course_id' => $course->id],
                    [
                        'status'      => 'approved',
                        'approved_at' => now()->subDays(rand(20, 60)),
                    ]
                );
                $enrollments[] = $enrollment;

                // enrolled_count is computed via eager loading, no column to update
            }
        }

        // ─────────────────────────────────────────────
        // GRADES  (for all new enrollments)
        // ─────────────────────────────────────────────
        // Varied performance profiles per student
        $profiles = [
            'Yassine Amrani' => [75, 95],   // solid performer
            'Salma Bennani' => [60, 85],   // average
            'Mehdi Alaoui' => [85, 100],  // top student
            'Hamza Cherkaoui' => [55, 80],   // below average
            'Imane Fassi' => [70, 90],   // good
            'Adam Berrada' => [50, 75],   // struggling
            'Nora Ziani' => [80, 98],   // excellent
            'Rayan Lahlou' => [62, 82],   // average
            'Alice Cooper' => [78, 96],   // demo student: strong performer
        ];

        foreach ($enrollmentMap as $sname => $codes) {
            $student = $students[$sname];
            [$min, $max] = $profiles[$sname];

            foreach ($codes as $code) {
                $course     = Course::where('code', $code)->first();
                if (!$course) continue;

                $enrollment = Enrollment::where('student_id', $student->id)
                    ->where('course_id', $course->id)->first();
                if (!$enrollment) continue;

                $midterm     = rand($min, $max);
                $final       = rand($min, $max);
                $assignments = rand($min, $max);
                $attendance  = rand(max($min, 65), 100);
                $total       = round($midterm * 0.3 + $final * 0.4 + $assignments * 0.2 + $attendance * 0.1, 2);
                $letter      = Grade::calculateLetterGrade($total);
                $gpa         = Grade::calculateGpaPoints($letter);

                Grade::firstOrCreate(
                    ['student_id' => $student->id, 'course_id' => $course->id],
                    [
                        'enrollment_id'     => $enrollment->id,
                        'midterm_score'     => $midterm,
                        'final_score'       => $final,
                        'assignments_score' => $assignments,
                        'attendance_score'  => $attendance,
                        'total_score'       => $total,
                        'grade_letter'      => $letter,
                        'gpa_points'        => $gpa,
                    ]
                );
            }

            // Update student GPA
            $avg = Grade::where('student_id', $student->id)->avg('gpa_points');
            $student->update(['gpa' => round($avg ?? 0, 2)]);
        }

        // ─────────────────────────────────────────────
        // ATTENDANCE  (45 school days back per enrollment)
        // ─────────────────────────────────────────────
        // Absence rates per student (higher = more absences)
        $absenceRates = [
            'Yassine Amrani' => 0.08,
            'Salma Bennani' => 0.15,
            'Mehdi Alaoui' => 0.05,
            'Hamza Cherkaoui' => 0.22,  // frequently absent
            'Imane Fassi' => 0.10,
            'Adam Berrada' => 0.25,  // worst attendance
            'Nora Ziani' => 0.07,
            'Rayan Lahlou' => 0.12,
            'Alice Cooper' => 0.06,
        ];

        foreach ($enrollmentMap as $sname => $codes) {
            $student     = $students[$sname];
            $absenceRate = $absenceRates[$sname];
            $lateRate    = $absenceRate * 0.5;

            foreach ($codes as $code) {
                $course = Course::where('code', $code)->first();
                if (!$course) continue;

                $schoolDaysRecorded = 0;
                for ($daysBack = 60; $daysBack >= 1 && $schoolDaysRecorded < 45; $daysBack--) {
                    $date = now()->subDays($daysBack);

                    // Skip weekends
                    if (in_array($date->dayOfWeek, [0, 6])) continue;

                    $schoolDaysRecorded++;
                    $rand = mt_rand() / mt_getrandmax();

                    if ($rand < $absenceRate) {
                        $status = 'absent';
                    } elseif ($rand < $absenceRate + $lateRate) {
                        $status = 'late';
                    } elseif ($rand < $absenceRate + $lateRate + 0.03) {
                        $status = 'excused';
                    } else {
                        $status = 'present';
                    }

                    Attendance::firstOrCreate(
                        [
                            'course_id'  => $course->id,
                            'student_id' => $student->id,
                            'date'       => $date->toDateString(),
                        ],
                        [
                            'status'     => $status,
                            'created_by' => $admin->id,
                        ]
                    );
                }
            }
        }

        $this->command->info('Demo users seeded: 4 teachers (tanas1–4@scms.com), 8 students (sanas1–8@scms.com).');
        $this->command->info('All accounts use password: password');
    }
}
