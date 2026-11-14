<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'super_admin', 'display_name' => 'Super Admin',  'description' => 'Full system access'],
            ['name' => 'admin',       'display_name' => 'Admin',         'description' => 'Manage users and courses'],
            ['name' => 'teacher',     'display_name' => 'Teacher',       'description' => 'Manage courses and grades'],
            ['name' => 'student',     'display_name' => 'Student',       'description' => 'Enroll and view courses'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
