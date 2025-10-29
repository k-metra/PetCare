<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\AppointmentCancelled;
use App\Mail\AppointmentRescheduled;

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
                'appointment_date' => 'required|date',
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
                'pets.*.dentalCareDetails' => 'nullable|array',
                'pets.*.dentalCareDetails.procedure' => 'required_with:pets.*.dentalCareDetails|string',
                'pets.*.dentalCareDetails.size' => 'required_with:pets.*.dentalCareDetails|string',
                'pets.*.dentalCareDetails.procedurePrice' => 'required_with:pets.*.dentalCareDetails|numeric',
                'pets.*.dentalCareDetails.anesthetic' => 'required_with:pets.*.dentalCareDetails|string',
                'pets.*.dentalCareDetails.anestheticPrice' => 'required_with:pets.*.dentalCareDetails|numeric',
                'pets.*.dentalCareDetails.totalPrice' => 'required_with:pets.*.dentalCareDetails|numeric',
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
                    'grooming_details' => $petData['groomingDetails'] ?? null,
                    'dental_care_details' => $petData['dentalCareDetails'] ?? null
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
            $appointment->load(['pets', 'services', 'user']);

            DB::commit();

            // Trigger notification for admin/staff
            \App\Http\Controllers\Api\NotificationController::triggerNotification(
                'new_appointment',
                "New appointment booked by {$appointment->user->name}",
                [
                    'appointment_id' => $appointment->id,
                    'customer_name' => $appointment->user->name,
                    'appointment_date' => \Carbon\Carbon::parse($appointment->appointment_date)->format('M j, Y'),
                    'appointment_time' => $appointment->appointment_time,
                    'pets_count' => $appointment->pets->count(),
                    'services' => $appointment->services->pluck('name')->toArray()
                ]
            );

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

            // For completed appointments, include medical records
            $appointments->transform(function ($appointment) {
                if ($appointment->status === 'completed') {
                    $medicalRecords = \DB::table('medical_records')
                        ->where('appointment_id', $appointment->id)
                        ->get()
                        ->map(function ($record) {
                            $record->selected_tests = json_decode($record->selected_tests, true);
                            return $record;
                        });
                    
                    $appointment->medical_records = $medicalRecords;
                }
                return $appointment;
            });

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
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve services',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }

    /**
     * Update (reschedule) user's own appointment
     */
    public function update(Request $request, $id)
    {
        try {
            // Find the appointment that belongs to the authenticated user
            $appointment = $request->user()->appointments()->findOrFail($id);
            
            // Only allow rescheduling of pending appointments
            if ($appointment->status !== 'pending') {
                return response()->json([
                    'status' => false,
                    'message' => 'Only pending appointments can be rescheduled'
                ], 400)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            }

            // Validate the request
            $validator = Validator::make($request->all(), [
                'appointment_date' => 'required|date',
                'appointment_time' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            }

            // Check if the selected date is not Sunday
            $selectedDate = new \DateTime($request->appointment_date);
            if ($selectedDate->format('w') == 0) { // 0 = Sunday
                return response()->json([
                    'status' => false,
                    'message' => 'Appointments cannot be scheduled on Sundays'
                ], 422)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            }

            // Update appointment
            $appointment->update([
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
            ]);
            
            $appointment->load(['pets', 'services']);

            return response()->json([
                'status' => true,
                'message' => 'Appointment rescheduled successfully',
                'appointment' => $appointment
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Appointment not found or does not belong to you'
            ], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to reschedule appointment',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }

    /**
     * Cancel user's own appointment (only pending appointments)
     */
    public function cancel(Request $request, $id)
    {
        try {
            // Find the appointment that belongs to the authenticated user
            $appointment = $request->user()->appointments()->findOrFail($id);
            
            // Only allow cancellation of pending appointments
            if ($appointment->status !== 'pending') {
                return response()->json([
                    'status' => false,
                    'message' => 'Only pending appointments can be cancelled'
                ], 400)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            }

            // Update appointment status to cancelled
            $appointment->update(['status' => 'cancelled']);
            $appointment->load(['pets', 'services', 'user']);

            // Trigger notification for admin/staff
            \App\Http\Controllers\Api\NotificationController::triggerNotification(
                'appointment_cancelled',
                "Appointment cancelled by {$appointment->user->name}",
                [
                    'appointment_id' => $appointment->id,
                    'customer_name' => $appointment->user->name,
                    'appointment_date' => \Carbon\Carbon::parse($appointment->appointment_date)->format('M j, Y'),
                    'appointment_time' => $appointment->appointment_time,
                    'pets_count' => $appointment->pets->count(),
                    'services' => $appointment->services->pluck('name')->toArray()
                ]
            );

            return response()->json([
                'status' => true,
                'message' => 'Appointment cancelled successfully',
                'appointment' => $appointment
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Appointment not found or does not belong to you'
            ], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to cancel appointment',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }
}
