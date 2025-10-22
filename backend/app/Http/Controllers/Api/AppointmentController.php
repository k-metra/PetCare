<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Store a newly created appointment.
     */
    public function store(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'appointment_date' => 'required|date|after:today',
                'appointment_time' => 'required|string',
                'pets' => 'required|array|min:1|max:5',
                'pets.*.type' => 'required|in:dog,cat',
                'pets.*.breed' => 'required|string|max:255',
                'pets.*.name' => 'required|string|max:255',
                'pets.*.groomingDetails' => 'nullable|array',
                'pets.*.groomingDetails.*' => 'array', // Each category is an array
                'pets.*.groomingDetails.*.*.service' => 'required|string',
                'pets.*.groomingDetails.*.*.size' => 'required|string',
                'pets.*.groomingDetails.*.*.price' => 'required|numeric',
                'pets.*.groomingDetails.*.*.package' => 'required|string',
                'services' => 'required|array|min:1',
                'services.*' => 'required|string',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if the selected date is not Sunday
            $selectedDate = new \DateTime($request->appointment_date);
            if ($selectedDate->format('w') == 0) { // 0 = Sunday
                return response()->json([
                    'status' => false,
                    'message' => 'Appointments cannot be scheduled on Sundays'
                ], 422);
            }

            // Start database transaction
            DB::beginTransaction();

            // Create the appointment
            $appointment = Appointment::create([
                'user_id' => $request->user()->id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'status' => 'pending',
                'notes' => $request->notes
            ]);

            // Create pets for this appointment
            foreach ($request->pets as $petData) {
                $appointment->pets()->create([
                    'type' => $petData['type'],
                    'breed' => $petData['breed'],
                    'name' => $petData['name'],
                    'grooming_details' => $petData['groomingDetails'] ?? null
                ]);
            }

            // Attach services to the appointment
            $serviceIds = [];
            foreach ($request->services as $serviceName) {
                $service = Service::firstOrCreate(['name' => $serviceName]);
                $serviceIds[] = $service->id;
            }
            $appointment->services()->attach($serviceIds);

            // Load relationships for response
            $appointment->load(['pets', 'services']);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Appointment scheduled successfully',
                'appointment' => $appointment
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'status' => false,
                'message' => 'Failed to schedule appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all appointments for the authenticated user.
     */
    public function index(Request $request)
    {
        try {
            $appointments = $request->user()
                ->appointments()
                ->with(['pets', 'services'])
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'appointments' => $appointments
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available services.
     */
    public function getServices()
    {
        try {
            $services = Service::all();
            return response()->json([
                'status' => true,
                'services' => $services
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve services',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
