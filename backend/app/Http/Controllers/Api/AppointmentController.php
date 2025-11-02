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
            // Log the incoming request data for debugging
            \Log::info('APPOINTMENT REQUEST RECEIVED', [
                'raw_request_data' => $request->all(),
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name
            ]);

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

            // Check if the time slot is not fully booked
            $maxAppointmentsPerSlot = config('appointments.max_appointments_per_slot', 3);
            $existingAppointments = Appointment::whereDate('appointment_date', $request->appointment_date)
                ->where('appointment_time', $request->appointment_time)
                ->whereIn('status', ['pending', 'confirmed'])
                ->count();

            // Add detailed debug logging
            \Log::info('BOOKING LIMIT CHECK', [
                'request_date' => $request->appointment_date,
                'request_time' => $request->appointment_time,
                'config_max_appointments' => $maxAppointmentsPerSlot,
                'existing_appointments_count' => $existingAppointments,
                'user_id' => $request->user()->id,
                'user_name' => $request->user()->name,
                'check_result' => $existingAppointments >= $maxAppointmentsPerSlot ? 'WOULD_BLOCK' : 'WOULD_ALLOW'
            ]);

            // Log the existing appointments for this slot
            if ($existingAppointments > 0) {
                $existingAppointmentsList = Appointment::whereDate('appointment_date', $request->appointment_date)
                    ->where('appointment_time', $request->appointment_time)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->with('user')
                    ->get();
                    
                \Log::info('EXISTING APPOINTMENTS FOR SLOT', [
                    'date' => $request->appointment_date,
                    'time' => $request->appointment_time,
                    'appointments' => $existingAppointmentsList->map(function($apt) {
                        return [
                            'id' => $apt->id,
                            'user_name' => $apt->user->name,
                            'status' => $apt->status,
                            'created_at' => $apt->created_at->toISOString()
                        ];
                    })
                ]);
            }

            if ($existingAppointments >= $maxAppointmentsPerSlot) {
                \Log::warning('APPOINTMENT BOOKING BLOCKED - SLOT FULL', [
                    'date' => $request->appointment_date,
                    'time' => $request->appointment_time,
                    'existing_appointments' => $existingAppointments,
                    'max_appointments_per_slot' => $maxAppointmentsPerSlot,
                    'blocked_user' => $request->user()->name
                ]);
                
                return response()->json([
                    'status' => false,
                    'message' => 'This time slot is fully booked. Please select a different time.',
                    'error_type' => 'slot_full',
                    'available_slots' => $existingAppointments,
                    'max_slots' => $maxAppointmentsPerSlot
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

            \Log::info('APPOINTMENT CREATED SUCCESSFULLY', [
                'appointment_id' => $appointment->id,
                'user_name' => $request->user()->name,
                'date' => $appointment->appointment_date,
                'time' => $appointment->appointment_time,
                'status' => $appointment->status
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
     * Get available time slots for a specific date
     */
    public function getAvailableTimeSlots(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'required|date|after:today'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid date provided',
                    'errors' => $validator->errors()
                ], 422)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            }

            $selectedDate = new \DateTime($request->date);
            
            // Check if it's Sunday
            if ($selectedDate->format('w') == 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Appointments are not available on Sundays',
                    'available_slots' => []
                ], 422)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            }

            $maxAppointmentsPerSlot = config('appointments.max_appointments_per_slot', 3);
            $timeSlots = config('appointments.available_time_slots', [
                '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
                '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
                '2:00 PM', '2:30 PM', '3:00 PM'
            ]);

            // Get appointment counts for each time slot
            $appointmentCounts = Appointment::whereDate('appointment_date', $request->date)
                ->whereIn('status', ['pending', 'confirmed'])
                ->select('appointment_time', \DB::raw('count(*) as count'))
                ->groupBy('appointment_time')
                ->pluck('count', 'appointment_time')
                ->toArray();

            $availableSlots = [];
            foreach ($timeSlots as $timeSlot) {
                $bookedCount = $appointmentCounts[$timeSlot] ?? 0;
                $availableSlots[] = [
                    'time' => $timeSlot,
                    'available' => $bookedCount < $maxAppointmentsPerSlot,
                    'booked_count' => $bookedCount,
                    'max_capacity' => $maxAppointmentsPerSlot,
                    'remaining_slots' => max(0, $maxAppointmentsPerSlot - $bookedCount)
                ];
            }

            return response()->json([
                'status' => true,
                'date' => $request->date,
                'available_slots' => $availableSlots,
                'max_appointments_per_slot' => $maxAppointmentsPerSlot
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve available time slots',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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

            // Check if the time slot is not fully booked (excluding current appointment)
            $maxAppointmentsPerSlot = config('appointments.max_appointments_per_slot', 3);
            $existingAppointments = Appointment::whereDate('appointment_date', $request->appointment_date)
                ->where('appointment_time', $request->appointment_time)
                ->where('id', '!=', $appointment->id) // Exclude current appointment
                ->whereIn('status', ['pending', 'confirmed'])
                ->count();

            if ($existingAppointments >= $maxAppointmentsPerSlot) {
                return response()->json([
                    'status' => false,
                    'message' => 'This time slot is fully booked. Please select a different time.',
                    'error_type' => 'slot_full',
                    'available_slots' => $existingAppointments,
                    'max_slots' => $maxAppointmentsPerSlot
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
