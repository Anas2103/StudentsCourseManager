<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AcademicYearSeeder::class,
            DepartmentSeeder::class,
            ClassroomSeeder::class,
            UserSeeder::class,      // creates teachers + students
            CourseSeeder::class,    // creates courses (no enrollments)
            DemoUsersSeeder::class, // extra teachers/students + enrollments, grades, attendance
            SampleDataSeeder::class, // announcements, assignments
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Super Admin', 'superadmin@scms.com', 'password'],
                ['Admin',       'admin@scms.com',       'password'],
                ['Teacher',     'teacher1@scms.com',    'password'],
                ['Student',     'student1@scms.com',    'password'],
            ]
        );
    }
}
