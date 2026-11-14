<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Semester;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    public function run(): void
    {
        $year = AcademicYear::create([
            'name'       => '2024-2025',
            'start_date' => '2024-09-01',
            'end_date'   => '2025-06-30',
            'is_current' => true,
        ]);

        Semester::create([
            'name'             => 'Fall 2024',
            'academic_year_id' => $year->id,
            'start_date'       => '2024-09-01',
            'end_date'         => '2025-01-15',
            'is_current'       => false,
        ]);

        Semester::create([
            'name'             => 'Spring 2025',
            'academic_year_id' => $year->id,
            'start_date'       => '2025-01-20',
            'end_date'         => '2025-06-30',
            'is_current'       => true,
        ]);
    }
}
