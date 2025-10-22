<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Pet;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SampleAppointmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample users if they don't exist
        $user1 = User::firstOrCreate(
            ['email' => 'john@example.com'],
            [
                'name' => 'John Doe',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'role' => 'user'
            ]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'jane@example.com'],
            [
                'name' => 'Jane Smith', 
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'role' => 'user'
            ]
        );

        // Create sample services
        $services = [
            ['name' => 'Pet Grooming', 'price' => 500],
            ['name' => 'Health Checkups', 'price' => 800],
            ['name' => 'Vaccination', 'price' => 300],
            ['name' => 'Dental Care', 'price' => 600]
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(['name' => $service['name']], $service);
        }

        // Create sample appointments for the last few months
        $appointments = [
            // Today's completed appointments for analytics testing
            [
                'user_id' => $user1->id,
                'appointment_date' => Carbon::now()->format('Y-m-d'),
                'appointment_time' => '9:00 AM',
                'status' => 'completed'
            ],
            [
                'user_id' => $user2->id,
                'appointment_date' => Carbon::now()->format('Y-m-d'),
                'appointment_time' => '1:00 PM',
                'status' => 'completed'
            ],
            // Past appointments
            [
                'user_id' => $user1->id,
                'appointment_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'appointment_time' => '10:00 AM',
                'status' => 'completed'
            ],
            [
                'user_id' => $user2->id,
                'appointment_date' => Carbon::now()->subDays(10)->format('Y-m-d'),
                'appointment_time' => '2:00 PM',
                'status' => 'completed'
            ],
            [
                'user_id' => $user1->id,
                'appointment_date' => Carbon::now()->subDays(15)->format('Y-m-d'),
                'appointment_time' => '11:30 AM',
                'status' => 'completed'
            ],
            // Future appointments
            [
                'user_id' => $user2->id,
                'appointment_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'appointment_time' => '9:00 AM',
                'status' => 'pending'
            ],
            [
                'user_id' => $user1->id,
                'appointment_date' => Carbon::now()->addDays(7)->format('Y-m-d'),
                'appointment_time' => '3:30 PM',
                'status' => 'confirmed'
            ]
        ];

        foreach ($appointments as $appointmentData) {
            $appointment = Appointment::create($appointmentData);

            // Add sample pets
            $pet = Pet::create([
                'appointment_id' => $appointment->id,
                'type' => 'dog',
                'breed' => 'Golden Retriever',
                'name' => 'Max',
                'grooming_details' => json_encode([
                    'category' => 'Complete Grooming',
                    'size' => 'Large',
                    'price' => 750,
                    'isPackage' => true
                ])
            ]);

            // Attach services
            $serviceIds = Service::inRandomOrder()->take(2)->pluck('id');
            $appointment->services()->attach($serviceIds);
        }

        $this->command->info('Sample appointments created successfully!');
    }
}
