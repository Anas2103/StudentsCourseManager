<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Department;
use App\Models\Role;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Role::pluck('id', 'name');
        $depts = Department::pluck('id', 'code');

        // ---- Super Admin ----
        $sa = User::firstOrCreate(['email' => 'superadmin@scms.com'], [
            'name'     => 'Super Admin',
            'password' => Hash::make('password'),
            'role_id'  => $roles['super_admin'],
            'status'   => 'active',
        ]);
        Admin::firstOrCreate(['user_id' => $sa->id], ['user_id' => $sa->id, 'admin_id' => 'ADM-0001']);

        // ---- Admin ----
        $admin = User::firstOrCreate(['email' => 'admin@scms.com'], [
            'name'     => 'System Admin',
            'password' => Hash::make('password'),
            'role_id'  => $roles['admin'],
            'status'   => 'active',
        ]);
        Admin::firstOrCreate(['user_id' => $admin->id], ['user_id' => $admin->id, 'admin_id' => 'ADM-0002']);

        // ---- Demo Teacher ----
        $teacher1 = User::firstOrCreate(['email' => 'teacher1@scms.com'], [
            'name'     => 'Dr. John Smith',
            'password' => Hash::make('password'),
            'role_id'  => $roles['teacher'],
            'status'   => 'active',
        ]);
        Teacher::firstOrCreate(['user_id' => $teacher1->id], [
            'user_id'          => $teacher1->id,
            'teacher_id'       => 'TCH-0001',
            'department_id'    => $depts['CS'] ?? null,
            'qualification'    => 'PhD Computer Science',
            'specialization'   => 'Algorithms',
            'experience_years' => 8,
            'join_date'        => now()->subYears(5)->toDateString(),
            'status'           => 'active',
        ]);

        // ---- Demo Student ----
        $semester = \App\Models\Semester::where('is_current', true)->first();
        $year     = \App\Models\AcademicYear::where('is_current', true)->first();

        $student1 = User::firstOrCreate(['email' => 'student1@scms.com'], [
            'name'     => 'Alice Cooper',
            'password' => Hash::make('password'),
            'role_id'  => $roles['student'],
            'status'   => 'active',
        ]);
        Student::firstOrCreate(['user_id' => $student1->id], [
            'user_id'          => $student1->id,
            'student_id'       => 'STU-0001',
            'department_id'    => $depts['CS'] ?? null,
            'semester_id'      => $semester?->id,
            'academic_year_id' => $year?->id,
            'gender'           => 'female',
            'enrollment_date'  => now()->subMonths(3)->toDateString(),
            'status'           => 'active',
        ]);
    }
}
