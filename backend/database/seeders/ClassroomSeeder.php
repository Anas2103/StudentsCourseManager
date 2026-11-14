<?php

namespace Database\Seeders;

use App\Models\Classroom;
use Illuminate\Database\Seeder;

class ClassroomSeeder extends Seeder
{
    public function run(): void
    {
        $classrooms = [
            ['name' => 'Lecture Hall A',  'code' => 'LHA',  'capacity' => 100, 'building' => 'Main', 'floor' => '1', 'type' => 'lecture'],
            ['name' => 'Lecture Hall B',  'code' => 'LHB',  'capacity' => 80,  'building' => 'Main', 'floor' => '1', 'type' => 'lecture'],
            ['name' => 'CS Lab 1',        'code' => 'CSL1', 'capacity' => 30,  'building' => 'Tech', 'floor' => '2', 'type' => 'lab'],
            ['name' => 'CS Lab 2',        'code' => 'CSL2', 'capacity' => 30,  'building' => 'Tech', 'floor' => '2', 'type' => 'lab'],
            ['name' => 'Seminar Room 1',  'code' => 'SR1',  'capacity' => 20,  'building' => 'Main', 'floor' => '3', 'type' => 'seminar'],
        ];

        foreach ($classrooms as $room) {
            Classroom::firstOrCreate(['code' => $room['code']], $room);
        }
    }
}
