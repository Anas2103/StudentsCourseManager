<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Computer Science',       'code' => 'CS',   'description' => 'Software, AI, and Computing'],
            ['name' => 'Mathematics',             'code' => 'MATH', 'description' => 'Pure and Applied Mathematics'],
            ['name' => 'Physics',                 'code' => 'PHY',  'description' => 'Classical and Modern Physics'],
            ['name' => 'Business Administration', 'code' => 'BUS',  'description' => 'Management and Business Studies'],
            ['name' => 'English Literature',      'code' => 'ENG',  'description' => 'Language and Literature'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['code' => $dept['code']], $dept);
        }
    }
}
