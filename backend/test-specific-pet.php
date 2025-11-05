<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\InventoryUsage;
use App\Models\Pet;

echo "Testing specific pet vaccination records:\n";
echo "User ID: 1, Pet ID: 47\n\n";

// Check if the pet exists and belongs to user 1
$pet = Pet::whereHas('appointment', function ($query) {
    $query->where('user_id', 1);
})->where('id', 47)->first();

if (!$pet) {
    echo "Pet ID 47 does not exist or does not belong to user 1\n";
    
    // Check what pets belong to user 1
    $userPets = Pet::whereHas('appointment', function ($query) {
        $query->where('user_id', 1);
    })->get();
    
    echo "Pets belonging to user 1:\n";
    foreach ($userPets as $userPet) {
        echo "- Pet ID: " . $userPet->id . ", Name: " . $userPet->name . ", Type: " . $userPet->type . "\n";
    }
} else {
    echo "Found pet: " . $pet->name . " (ID: " . $pet->id . ")\n\n";
    
    // Now check vaccination records for this pet
    $vaccinationRecords = InventoryUsage::with([
        'product.category',
        'appointment.pets',
        'appointment.medicalRecords'
    ])
    ->whereHas('appointment', function ($query) {
        $query->where('user_id', 1)
              ->where('status', 'completed');
    })
    ->whereHas('product', function ($query) {
        $query->whereHas('category', function ($categoryQuery) {
            $categoryQuery->where('name', 'Vaccines');
        });
    })
    ->orderBy('created_at', 'desc')
    ->get();

    echo "Total vaccination records for user 1: " . $vaccinationRecords->count() . "\n\n";
    
    echo "Debugging pet IDs in vaccination records:\n";
    foreach ($vaccinationRecords as $record) {
        echo "Vaccination Record ID: " . $record->id . "\n";
        echo "Vaccine: " . $record->product->name . "\n";
        echo "Appointment ID: " . $record->appointment_id . "\n";
        echo "Pets in this appointment:\n";
        foreach ($record->appointment->pets as $appointmentPet) {
            echo "  - Pet ID: " . $appointmentPet->id . ", Name: " . $appointmentPet->name . "\n";
        }
        echo "\n";
    }
    
    $petVaccinations = [];
    foreach ($vaccinationRecords as $record) {
        foreach ($record->appointment->pets as $appointmentPet) {
            if ($appointmentPet->id == 47) {
                $petVaccinations[] = $record;
                echo "Found vaccination for pet 47: " . $record->product->name . " on " . $record->created_at->format('Y-m-d') . "\n";
                break;
            }
        }
    }
    
    echo "Vaccination records specifically for pet 47: " . count($petVaccinations) . "\n";
}