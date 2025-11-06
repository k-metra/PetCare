<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\InventoryUsage;

echo "Debugging vaccination records grouping:\n\n";

// Get the first user to test with
$user = \App\Models\User::first();
if (!$user) {
    echo "No users found\n";
    exit;
}

echo "Testing for user: " . $user->name . " (ID: " . $user->id . ")\n\n";

// Simulate the API call
$vaccinationRecords = InventoryUsage::with([
    'product.category',
    'appointment.pets',
    'appointment.medicalRecords'
])
->whereHas('appointment', function ($query) use ($user) {
    $query->where('user_id', $user->id)
          ->where('status', 'completed');
})
->whereHas('product', function ($query) {
    $query->whereHas('category', function ($categoryQuery) {
        $categoryQuery->where('name', 'Vaccines');
    });
})
->orderBy('created_at', 'desc')
->get();

echo "Found " . $vaccinationRecords->count() . " vaccination records\n\n";

// Group vaccination records by pet (same logic as the controller)
$vaccinationsByPet = [];

foreach ($vaccinationRecords as $record) {
    foreach ($record->appointment->pets as $pet) {
        echo "Processing pet: " . $pet->name . " (ID: " . $pet->id . ") from appointment " . $record->appointment_id . "\n";
        
        if (!isset($vaccinationsByPet[$pet->id])) {
            $vaccinationsByPet[$pet->id] = [
                'pet_id' => $pet->id,
                'pet_name' => $pet->name,
                'pet_type' => $pet->type,
                'pet_breed' => $pet->breed,
                'vaccination_records' => []
            ];
            echo "  -> Created new pet group for " . $pet->name . " (ID: " . $pet->id . ")\n";
        } else {
            echo "  -> Adding to existing pet group for " . $pet->name . " (ID: " . $pet->id . ")\n";
        }
        
        // Get doctor name from medical record for this appointment and pet
        $doctorName = 'Name Not Set';
        $medicalRecord = $record->appointment->medicalRecords->where('pet_id', $pet->id)->first();
        if ($medicalRecord && $medicalRecord->doctor_name) {
            $doctorName = $medicalRecord->doctor_name;
        }
        
        $vaccinationsByPet[$pet->id]['vaccination_records'][] = [
            'id' => $record->id,
            'given_date' => $record->created_at->format('Y-m-d'),
            'vaccine_name' => $record->product->name,
            'quantity' => $record->quantity_used,
            'appointment_id' => $record->appointment_id,
            'veterinarian' => $doctorName,
            'diagnosis' => $record->appointment->notes
        ];
        echo "  -> Added vaccination: " . $record->product->name . "\n";
    }
}

echo "\n=== FINAL GROUPED RESULTS ===\n";
foreach ($vaccinationsByPet as $petData) {
    echo "Pet: " . $petData['pet_name'] . " (ID: " . $petData['pet_id'] . ") - " . $petData['pet_type'] . " " . $petData['pet_breed'] . "\n";
    echo "  Vaccinations: " . count($petData['vaccination_records']) . "\n";
    foreach ($petData['vaccination_records'] as $vaccination) {
        echo "    - " . $vaccination['vaccine_name'] . " on " . $vaccination['given_date'] . "\n";
    }
    echo "\n";
}

echo "\n=== CHECKING FOR DUPLICATE NAME+BREED COMBINATIONS ===\n";
$nameBreedCombos = [];
foreach ($vaccinationsByPet as $petData) {
    $combo = $petData['pet_name'] . '|' . $petData['pet_breed'];
    if (!isset($nameBreedCombos[$combo])) {
        $nameBreedCombos[$combo] = [];
    }
    $nameBreedCombos[$combo][] = $petData;
}

foreach ($nameBreedCombos as $combo => $pets) {
    if (count($pets) > 1) {
        list($name, $breed) = explode('|', $combo);
        echo "DUPLICATE FOUND: " . count($pets) . " pets named '$name' with breed '$breed':\n";
        foreach ($pets as $pet) {
            echo "  - Pet ID: " . $pet['pet_id'] . " with " . count($pet['vaccination_records']) . " vaccinations\n";
        }
        echo "\n";
    }
}