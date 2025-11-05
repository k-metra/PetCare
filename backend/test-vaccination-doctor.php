<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\InventoryUsage;

echo "Testing vaccination records with doctor names:\n";

$vaccinationRecords = InventoryUsage::with([
    'product.category',
    'appointment.pets',
    'appointment.medicalRecords'
])
->whereHas('product', function ($query) {
    $query->whereHas('category', function ($categoryQuery) {
        $categoryQuery->where('name', 'Vaccines');
    });
})
->take(3)
->get();

foreach ($vaccinationRecords as $record) {
    echo "\n=== Vaccination Record ===\n";
    echo "Vaccine: " . $record->product->name . "\n";
    echo "Appointment ID: " . $record->appointment_id . "\n";
    echo "Pets: " . $record->appointment->pets->pluck('name')->join(', ') . "\n";
    
    foreach ($record->appointment->pets as $pet) {
        $medicalRecord = $record->appointment->medicalRecords->where('pet_id', $pet->id)->first();
        $doctorName = $medicalRecord && $medicalRecord->doctor_name ? $medicalRecord->doctor_name : 'Name Not Set';
        echo "Pet: " . $pet->name . " | Doctor: " . $doctorName . "\n";
    }
}