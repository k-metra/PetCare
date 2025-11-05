<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VaccinationRecord;
use Illuminate\Http\Request;
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
            
            // Get vaccination records grouped by pet
            $vaccinationRecords = VaccinationRecord::forUser($user->id)
                ->latestFirst()
                ->get()
                ->groupBy('pet_id')
                ->map(function ($records, $petId) {
                    // Get pet information from the first record
                    $firstRecord = $records->first();
                    $petInfo = $this->getPetInfoFromAppointment($firstRecord->appointment_id, $petId);
                    
                    return [
                        'pet_id' => $petId,
                        'pet_name' => $petInfo['name'] ?? 'Unknown Pet',
                        'pet_type' => $petInfo['type'] ?? 'Unknown',
                        'pet_breed' => $petInfo['breed'] ?? 'Unknown',
                        'vaccination_records' => $records->map(function ($record) {
                            return [
                                'id' => $record->id,
                                'given_date' => $record->given_date->format('Y-m-d'),
                                'vaccine_name' => $record->vaccine_name,
                                'veterinarian' => $record->veterinarian,
                                'diagnosis' => $record->diagnosis,
                                'appointment_id' => $record->appointment_id,
                            ];
                        })->values()
                    ];
                })->values();

            return response()->json([
                'status' => true,
                'vaccination_records' => $vaccinationRecords,
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

            $vaccinationRecords = VaccinationRecord::forUser($userId)
                ->forPet($petId)
                ->latestFirst()
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'given_date' => $record->given_date->format('Y-m-d'),
                        'vaccine_name' => $record->vaccine_name,
                        'veterinarian' => $record->veterinarian,
                        'diagnosis' => $record->diagnosis,
                        'appointment_id' => $record->appointment_id,
                    ];
                });

            return response()->json([
                'status' => true,
                'vaccination_records' => $vaccinationRecords,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch pet vaccination records', [
                'user_id' => $userId,
                'pet_id' => $petId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch vaccination records',
            ], 500);
        }
    }

    /**
     * Create a new vaccination record (admin/staff only)
     */
    public function store(Request $request)
    {
        try {
            // Verify user has admin/staff privileges
            if (!in_array($request->user()->role, ['admin', 'staff'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $request->validate([
                'given_date' => 'required|date',
                'vaccine_name' => 'required|string|max:255',
                'veterinarian' => 'required|string|max:255',
                'diagnosis' => 'nullable|string',
                'pet_id' => 'required|integer',
                'user_id' => 'required|integer|exists:users,id',
                'appointment_id' => 'nullable|integer|exists:appointments,id',
            ]);

            $vaccinationRecord = VaccinationRecord::create($request->all());

            return response()->json([
                'status' => true,
                'message' => 'Vaccination record created successfully',
                'vaccination_record' => $vaccinationRecord,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create vaccination record', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to create vaccination record',
            ], 500);
        }
    }

    /**
     * Helper function to get pet information from appointment
     */
    private function getPetInfoFromAppointment($appointmentId, $petId)
    {
        if (!$appointmentId) {
            return ['name' => 'Pet #' . $petId, 'type' => 'Unknown', 'breed' => 'Unknown'];
        }

        try {
            $appointment = \App\Models\Appointment::with('pets')->find($appointmentId);
            if ($appointment) {
                $pet = $appointment->pets->first(function ($pet) use ($petId) {
                    return $pet->id == $petId;
                });
                
                if ($pet) {
                    return [
                        'name' => $pet->name,
                        'type' => $pet->type,
                        'breed' => $pet->breed,
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning('Could not fetch pet info from appointment', [
                'appointment_id' => $appointmentId,
                'pet_id' => $petId,
                'error' => $e->getMessage(),
            ]);
        }

        return ['name' => 'Pet #' . $petId, 'type' => 'Unknown', 'breed' => 'Unknown'];
    }
}
