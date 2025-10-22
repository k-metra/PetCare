<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MedicalRecordController extends Controller
{
    /**
     * Store medical examination records
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'appointment_id' => 'required|integer|exists:appointments,id',
                'doctor_name' => 'nullable|string|max:255',
                'pet_records' => 'array',
                'pet_records.*.petId' => 'required|integer',
                'pet_records.*.petName' => 'required|string',
                'pet_records.*.weight' => 'nullable|string',
                'pet_records.*.symptoms' => 'nullable|string',
                'pet_records.*.diagnosis' => 'nullable|string',
                'pet_records.*.testType' => 'nullable|string',
                'pet_records.*.selectedTests' => 'array',
                'pet_records.*.medication' => 'nullable|string',
                'pet_records.*.treatment' => 'nullable|string',
                'pet_records.*.notes' => 'nullable|string',
                'total_cost' => 'nullable|numeric',
            ]);

            DB::beginTransaction();

            // Only create medical records if there's actual medical data
            if ($request->has('pet_records') && !empty($request->pet_records)) {
                foreach ($request->pet_records as $petRecord) {
                    // Check if this pet has any medical data
                    $hasMedicalData = !empty($petRecord['weight']) || 
                                     !empty($petRecord['symptoms']) || 
                                     !empty($petRecord['diagnosis']) || 
                                     !empty($petRecord['testType']) || 
                                     !empty($petRecord['medication']) || 
                                     !empty($petRecord['treatment']) ||
                                     !empty($petRecord['selectedTests']);

                    if ($hasMedicalData) {
                        DB::table('medical_records')->insert([
                            'appointment_id' => $request->appointment_id,
                            'pet_id' => $petRecord['petId'],
                            'pet_name' => $petRecord['petName'],
                            'doctor_name' => $request->doctor_name && trim($request->doctor_name) !== '' ? $request->doctor_name : null,
                            'weight' => $petRecord['weight'] ?? null,
                            'symptoms' => $petRecord['symptoms'] ?? null,
                            'medication' => $petRecord['medication'] ?? null,
                            'treatment' => $petRecord['treatment'] ?? null,
                            'diagnosis' => $petRecord['diagnosis'] ?? null,
                            'test_type' => $petRecord['testType'] ?? null,
                            'selected_tests' => json_encode($petRecord['selectedTests'] ?? []),
                            'test_cost' => collect($petRecord['selectedTests'] ?? [])->sum('price'),
                            'notes' => $petRecord['notes'] ?? null,
                            'created_at' => Carbon::now(),
                            'updated_at' => Carbon::now(),
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Medical records saved successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'status' => false,
                'message' => 'Failed to save medical records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all medical records
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('medical_records');
            
            // Filter by appointment_id if provided
            if ($request->has('appointment_id')) {
                $query->where('appointment_id', $request->appointment_id);
            }
            
            $records = $query
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($record) {
                    $record->selected_tests = json_decode($record->selected_tests, true);
                    return $record;
                });

            return response()->json([
                'status' => true,
                'records' => $records
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve medical records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medical records for a specific pet
     */
    public function getPetRecords(Request $request, $petId)
    {
        try {
            $records = DB::table('medical_records')
                ->where('pet_id', $petId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($record) {
                    $record->selected_tests = json_decode($record->selected_tests, true);
                    return $record;
                });

            return response()->json([
                'status' => true,
                'records' => $records
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve pet records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search medical records by pet name
     */
    public function search(Request $request)
    {
        try {
            $searchTerm = $request->input('search', '');
            
            $records = DB::table('medical_records')
                ->where('pet_name', 'LIKE', '%' . $searchTerm . '%')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($record) {
                    $record->selected_tests = json_decode($record->selected_tests, true);
                    return $record;
                });

            return response()->json([
                'status' => true,
                'records' => $records
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to search medical records',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}