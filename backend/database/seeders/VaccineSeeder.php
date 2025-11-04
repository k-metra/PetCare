<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;

class VaccineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Vaccines category if it doesn't exist
        $vaccineCategory = Category::firstOrCreate(
            ['name' => 'Vaccines'],
            ['description' => 'Veterinary vaccines for pets']
        );

        // Sample vaccines data
        $vaccines = [
            [
                'name' => 'DHPP Vaccine (5-in-1)',
                'description' => 'Distemper, Hepatitis, Parvovirus, Parainfluenza, Pneumonia',
                'price' => 800.00,
                'quantity' => 50
            ],
            [
                'name' => 'Rabies Vaccine',
                'description' => 'Annual rabies vaccination for dogs and cats',
                'price' => 350.00,
                'quantity' => 75
            ],
            [
                'name' => 'Bordetella Vaccine',
                'description' => 'Kennel cough vaccine for dogs',
                'price' => 450.00,
                'quantity' => 30
            ],
            [
                'name' => 'FVRCP Vaccine (3-in-1)',
                'description' => 'Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia',
                'price' => 650.00,
                'quantity' => 40
            ],
            [
                'name' => 'FeLV Vaccine',
                'description' => 'Feline Leukemia Virus vaccine',
                'price' => 550.00,
                'quantity' => 25
            ],
            [
                'name' => 'Lyme Disease Vaccine',
                'description' => 'Protection against Lyme disease for dogs',
                'price' => 700.00,
                'quantity' => 20
            ],
            [
                'name' => 'Canine Influenza Vaccine',
                'description' => 'H3N2 and H3N8 influenza protection',
                'price' => 900.00,
                'quantity' => 15
            ],
            [
                'name' => 'Giardia Vaccine',
                'description' => 'Protection against Giardia infection',
                'price' => 600.00,
                'quantity' => 35
            ]
        ];

        // Create vaccine products
        foreach ($vaccines as $vaccine) {
            Product::firstOrCreate(
                ['name' => $vaccine['name'], 'category_id' => $vaccineCategory->id],
                [
                    'description' => $vaccine['description'],
                    'price' => $vaccine['price'],
                    'quantity' => $vaccine['quantity'],
                    'category_id' => $vaccineCategory->id
                ]
            );
        }

        echo "Vaccine seeder completed! Created " . count($vaccines) . " vaccines in the '{$vaccineCategory->name}' category.\n";
    }
}
