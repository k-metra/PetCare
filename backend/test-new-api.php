<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\InventoryUsage;

echo "Testing new vaccination records API approach:\n";
echo "User ID: 1\n\n";

// Simulate the new API call
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

$allPetVaccinations = [];
foreach ($vaccinationRecords as $record) {
    foreach ($record->appointment->pets as $pet) {
        // Get doctor name from medical record for this appointment and pet
        $doctorName = 'Name Not Set';
        $medicalRecord = $record->appointment->medicalRecords->where('pet_id', $pet->id)->first();
        if ($medicalRecord && $medicalRecord->doctor_name) {
            $doctorName = $medicalRecord->doctor_name;
        }
        
        $allPetVaccinations[] = [
            'id' => $record->id,
            'pet_id' => $pet->id,
            'pet_name' => $pet->name,
            'pet_type' => $pet->type,
            'pet_breed' => $pet->breed,
            'given_date' => $record->created_at->format('Y-m-d'),
            'vaccine_name' => $record->product->name,
            'quantity' => $record->quantity_used,
            'appointment_id' => $record->appointment_id,
            'veterinarian' => $doctorName,
            'diagnosis' => $record->appointment->notes
        ];
    }
}

echo "Total vaccination records found: " . count($allPetVaccinations) . "\n\n";

foreach ($allPetVaccinations as $vaccination) {
    echo "Pet: " . $vaccination['pet_name'] . " (ID: " . $vaccination['pet_id'] . ")\n";
    echo "Vaccine: " . $vaccination['vaccine_name'] . "\n";
    echo "Date: " . $vaccination['given_date'] . "\n";
    echo "Veterinarian: " . $vaccination['veterinarian'] . "\n";
    echo "---\n";
}