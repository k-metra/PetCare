<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        \App\Models\User::create([
            'name' => 'Admin User',
            'email' => 'admin@petcare.com',
            'password' => bcrypt('admin123'), // Change this password!
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create staff user
        \App\Models\User::create([
            'name' => 'Staff Member',
            'email' => 'staff@petcare.com', 
            'password' => bcrypt('staff123'), // Change this password!
            'role' => 'staff',
            'email_verified_at' => now(),
        ]);

        echo "Admin and Staff users created successfully!\n";
        echo "Admin: admin@petcare.com / admin123\n";
        echo "Staff: staff@petcare.com / staff123\n";
        echo "Please change these default passwords!\n";
    }
}
