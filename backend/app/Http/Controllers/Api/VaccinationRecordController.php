<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pet;
use App\Models\InventoryUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class VaccinationRecordController extends Controller
{
    /**
     * Get vaccination records for the authenticated user's pets
     */
    public function getUserVaccinationRecords(Request $request)
    {
        try {
            $user = $request->user();
            
            // Get all vaccination records from inventory usage for completed appointments
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

            // Group vaccination records by pet
            $vaccinationsByPet = [];
            
            foreach ($vaccinationRecords as $record) {
                foreach ($record->appointment->pets as $pet) {
                    if (!isset($vaccinationsByPet[$pet->id])) {
                        $vaccinationsByPet[$pet->id] = [
                            'pet_id' => $pet->id,
                            'pet_name' => $pet->name,
                            'pet_type' => $pet->type,
                            'pet_breed' => $pet->breed,
                            'vaccination_records' => []
                        ];
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
                }
            }
            
            return response()->json([
                'status' => true,
                'vaccination_records' => array_values($vaccinationsByPet),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch vaccination records', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch vaccination records',
            ], 500);
        }
    }

    /**
     * Get vaccination records for a specific pet (admin/staff use)
     */
    public function getPetVaccinationRecords(Request $request, $userId, $petId)
    {
        try {
            // Verify user has admin/staff privileges
            if (!in_array($request->user()->role, ['admin', 'staff'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            // Get all vaccination records for the user
            $vaccinationRecords = InventoryUsage::with([
                'product.category',
                'appointment.pets',
                'appointment.medicalRecords'
            ])
            ->whereHas('appointment', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->where('status', 'completed');
            })
            ->whereHas('product', function ($query) {
                $query->whereHas('category', function ($categoryQuery) {
                    $categoryQuery->where('name', 'Vaccines');
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

            // Get all vaccination records and organize by pet
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

            return response()->json([
                'status' => true,
                'vaccination_records' => $allPetVaccinations,
                'message' => count($allPetVaccinations) > 0 ? 'Vaccination records found' : 'No vaccination records found for this user'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch pet vaccination records', [
                'user_id' => $userId,
                'pet_id' => $petId,
                'error' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch vaccination records: ' . $e->getMessage(),
            ], 500);
        }
    }
}