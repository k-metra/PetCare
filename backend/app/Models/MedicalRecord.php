<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'pet_id',
        'pet_name',
        'doctor_name',
        'weight',
        'symptoms',
        'medication',
        'treatment',
        'diagnosis',
        'test_type',
        'selected_tests',
        'test_cost',
        'notes',
    ];

    protected $casts = [
        'selected_tests' => 'array',
        'weight' => 'decimal:2',
        'test_cost' => 'decimal:2',
    ];

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }
}
