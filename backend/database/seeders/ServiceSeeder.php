<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Pet Grooming',
                'description' => 'Professional pet grooming services including bathing, haircuts, nail trimming, and more.',
                'price' => 50.00
            ],
            [
                'name' => 'Health Checkups',
                'description' => 'Comprehensive health examinations to ensure your pet is in optimal health.',
                'price' => 75.00
            ],
            [
                'name' => 'Vaccination',
                'description' => 'Essential vaccinations to protect your pet from various diseases.',
                'price' => 40.00
            ],
            [
                'name' => 'Dental Care',
                'description' => 'Professional dental cleaning and oral health care for your pets.',
                'price' => 120.00
            ]
        ];

        foreach ($services as $service) {
            \App\Models\Service::create($service);
        }
    }
}
