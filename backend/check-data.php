<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Category;
use App\Models\Product;
use App\Models\InventoryUsage;

echo "Categories:\n";
foreach (Category::all() as $cat) {
    echo $cat->id . ': ' . $cat->name . "\n";
}

echo "\nProducts with categories:\n";
foreach (Product::with('category')->get() as $prod) {
    echo $prod->name . ' (' . ($prod->category ? $prod->category->name : 'No category') . ")\n";
}

echo "\nTesting vaccination records API:\n";
// Test the new vaccination system by simulating what the API would return
$user = \App\Models\User::first(); // Get the first user for testing
if ($user) {
    echo "Testing for user: " . $user->name . " (ID: " . $user->id . ")\n";
    
    $vaccinationRecords = InventoryUsage::with([
        'product.category',
        'appointment.pets'
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

    echo "Found " . $vaccinationRecords->count() . " vaccination records for this user.\n";
    
    foreach ($vaccinationRecords as $record) {
        echo "- " . $record->product->name . " given to pets: " . 
             $record->appointment->pets->pluck('name')->join(', ') . 
             " on " . $record->created_at->format('Y-m-d') . "\n";
    }
} else {
    echo "No users found in database.\n";
}