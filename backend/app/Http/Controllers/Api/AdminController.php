<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get all appointments (admin/staff only)
     */
    public function getAllAppointments(Request $request)
    {
        try {
            $appointments = Appointment::with(['user', 'pets', 'services'])
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
     * Update appointment status (admin/staff only)
     */
    public function updateAppointmentStatus(Request $request, $id)
    {
        try {
            $appointment = Appointment::findOrFail($id);
            
            $request->validate([
                'status' => 'required|in:pending,confirmed,completed,cancelled'
            ]);

            $appointment->update([
                'status' => $request->status
            ]);

            $appointment->load(['user', 'pets', 'services']);

            return response()->json([
                'status' => true,
                'message' => 'Appointment status updated successfully',
                'appointment' => $appointment
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update appointment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users (admin only)
     */
    public function getAllUsers(Request $request)
    {
        try {
            $users = User::with(['appointments' => function($query) {
                $query->orderBy('appointment_date', 'desc');
            }])->orderBy('created_at', 'desc')->get();

            return response()->json([
                'status' => true,
                'users' => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user role (admin only)
     */
    public function updateUserRole(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            
            $request->validate([
                'role' => 'required|in:user,staff,admin'
            ]);

            $user->update([
                'role' => $request->role
            ]);

            return response()->json([
                'status' => true,
                'message' => 'User role updated successfully',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update user role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics (admin/staff only)
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $stats = [
                'total_appointments' => Appointment::count(),
                'pending_appointments' => Appointment::where('status', 'pending')->count(),
                'confirmed_appointments' => Appointment::where('status', 'confirmed')->count(),
                'completed_appointments' => Appointment::where('status', 'completed')->count(),
                'cancelled_appointments' => Appointment::where('status', 'cancelled')->count(),
                'total_users' => User::where('role', 'user')->count(),
                'total_staff' => User::whereIn('role', ['staff', 'admin'])->count(),
                'today_appointments' => Appointment::whereDate('appointment_date', today())->count(),
                'this_week_appointments' => Appointment::whereBetween('appointment_date', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),
            ];

            return response()->json([
                'status' => true,
                'stats' => $stats
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete appointment (admin/staff only - for canceled or pending appointments)
     */
    public function deleteAppointment(Request $request, $id)
    {
        try {
            $appointment = Appointment::findOrFail($id);
            
            // Only allow deletion of canceled or pending appointments
            if (!in_array($appointment->status, ['cancelled', 'pending'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Only canceled or pending appointments can be deleted'
                ], 400);
            }

            // Delete related records first (due to foreign key constraints)
            // Note: Laravel will handle cascade deletes if properly set up in migrations
            $appointment->delete();

            return response()->json([
                'status' => true,
                'message' => 'Appointment deleted successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Appointment not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get analytics data for admin dashboard
     */
    public function getAnalytics(Request $request)
    {
        try {
            // Get current date info
            $currentDate = now();
            $currentMonth = $currentDate->format('Y-m');
            $today = $currentDate->format('Y-m-d');

            // Monthly appointments for the last 12 months
            $monthlyAppointments = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = $currentDate->copy()->subMonths($i);
                $monthKey = $date->format('M Y');
                $yearMonth = $date->format('Y-m');
                
                $count = Appointment::whereYear('appointment_date', $date->year)
                    ->whereMonth('appointment_date', $date->month)
                    ->whereIn('status', ['pending', 'confirmed', 'completed'])
                    ->count();
                    
                $monthlyAppointments[$monthKey] = $count;
            }

            // Today's earnings (from completed appointments)
            $todayEarnings = 0;
            $todayAppointments = Appointment::with(['services', 'pets'])
                ->whereDate('appointment_date', $today)
                ->where('status', 'completed')
                ->get();

            foreach ($todayAppointments as $appointment) {
                // Add service costs
                $todayEarnings += $appointment->services->sum('price');
                
                // Add grooming costs
                foreach ($appointment->pets as $pet) {
                    if ($pet->grooming_details) {
                        $groomingDetails = is_string($pet->grooming_details) 
                            ? json_decode($pet->grooming_details, true) 
                            : $pet->grooming_details;
                        
                        if (isset($groomingDetails['price'])) {
                            $todayEarnings += $groomingDetails['price'];
                        }
                    }
                }
                
                // Add medical test costs
                $medicalRecords = DB::table('medical_records')
                    ->where('appointment_id', $appointment->id)
                    ->get();
                
                foreach ($medicalRecords as $record) {
                    $todayEarnings += $record->test_cost;
                }
            }

            // Monthly earnings (current month)
            $monthlyEarnings = 0;
            $monthlyAppointmentsCompleted = Appointment::with(['services', 'pets'])
                ->whereYear('appointment_date', $currentDate->year)
                ->whereMonth('appointment_date', $currentDate->month)
                ->where('status', 'completed')
                ->get();

            foreach ($monthlyAppointmentsCompleted as $appointment) {
                // Add service costs
                $monthlyEarnings += $appointment->services->sum('price');
                
                // Add grooming costs
                foreach ($appointment->pets as $pet) {
                    if ($pet->grooming_details) {
                        $groomingDetails = is_string($pet->grooming_details) 
                            ? json_decode($pet->grooming_details, true) 
                            : $pet->grooming_details;
                        
                        if (isset($groomingDetails['price'])) {
                            $monthlyEarnings += $groomingDetails['price'];
                        }
                    }
                }
                
                // Add medical test costs
                $medicalRecords = DB::table('medical_records')
                    ->where('appointment_id', $appointment->id)
                    ->get();
                
                foreach ($medicalRecords as $record) {
                    $monthlyEarnings += $record->test_cost;
                }
            }

            // Average monthly appointments (last 12 months)
            $totalAppointments = array_sum($monthlyAppointments);
            $avgMonthlyAppointments = round($totalAppointments / 12, 1);

            return response()->json([
                'status' => true,
                'analytics' => [
                    'monthlyAppointments' => $monthlyAppointments,
                    'todayEarnings' => $todayEarnings,
                    'monthlyEarnings' => $monthlyEarnings,
                    'avgMonthlyAppointments' => $avgMonthlyAppointments
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve analytics data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent appointments (excluding cancelled)
     */
    public function getRecentAppointments(Request $request)
    {
        try {
            $recentAppointments = Appointment::with(['user', 'pets', 'services'])
                ->whereIn('status', ['pending', 'confirmed', 'completed'])
                ->orderBy('created_at', 'desc')
                ->limit(10) // Get more than 3 in case some need to be filtered
                ->get();

            return response()->json([
                'status' => true,
                'appointments' => $recentAppointments
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve recent appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create walk-in appointment (admin/staff only)
     */
    public function createWalkInAppointment(Request $request)
    {
        try {
            // Log the incoming request for debugging
            \Log::info('Walk-in appointment request received', [
                'user_id' => $request->user()?->id,
                'user_role' => $request->user()?->role,
                'request_data' => $request->all()
            ]);

            $validatedData = $request->validate([
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|string|email|max:255',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|string',
                'pets' => 'required|array|min:1',
                'pets.*.type' => 'required|string|in:dog,cat',
                'pets.*.breed' => 'required|string|max:255',
                'pets.*.name' => 'required|string|max:255',
                'pets.*.groomingDetails' => 'nullable|array',
                'services' => 'required|array|min:1',
                'services.*' => 'string',
                'notes' => 'nullable|string|max:1000'
            ]);

            // Find or create user
            $user = User::where('email', $validatedData['customer_email'])->first();
            $nameWarning = null;
            
            if (!$user) {
                // Create new user for walk-in customer
                $user = User::create([
                    'name' => $validatedData['customer_name'],
                    'email' => $validatedData['customer_email'],
                    'password' => bcrypt('defaultpassword123'), // Default password
                    'role' => 'user',
                    'email_verified_at' => now() // Auto-verify walk-in customers
                ]);
            } else {
                // Check if the input name matches the existing user's name
                if (trim(strtolower($validatedData['customer_name'])) !== trim(strtolower($user->name))) {
                    $nameWarning = "Note: The email '{$validatedData['customer_email']}' belongs to '{$user->name}', not '{$validatedData['customer_name']}'. Using the correct name from our records.";
                    
                    \Log::info('Name mismatch detected for existing user', [
                        'existing_name' => $user->name,
                        'input_name' => $validatedData['customer_name'],
                        'email' => $validatedData['customer_email'],
                        'staff_user' => $request->user()->name
                    ]);
                }
                // Don't update the user's name - preserve the correct name in the database
            }

            // Create appointment
            $appointment = Appointment::create([
                'user_id' => $user->id,
                'appointment_date' => $validatedData['appointment_date'],
                'appointment_time' => $validatedData['appointment_time'],
                'status' => 'confirmed', // Walk-ins are auto-confirmed
                'notes' => $validatedData['notes'] ?? 'Walk-in appointment created by staff'
            ]);

            // Add pets
            foreach ($validatedData['pets'] as $petData) {
                $appointment->pets()->create([
                    'type' => $petData['type'],
                    'breed' => $petData['breed'],
                    'name' => $petData['name'],
                    'grooming_details' => isset($petData['groomingDetails']) ? json_encode($petData['groomingDetails']) : null
                ]);
            }

            // Add services
            foreach ($validatedData['services'] as $serviceName) {
                $appointment->services()->create([
                    'name' => $serviceName,
                    'description' => null
                ]);
            }

            // Load relationships for response
            $appointment->load(['user', 'pets', 'services']);

            $responseData = [
                'status' => true,
                'message' => 'Walk-in appointment created successfully',
                'appointment' => $appointment
            ];

            // Add warning if there was a name mismatch
            if ($nameWarning) {
                $responseData['warning'] = $nameWarning;
                $responseData['corrected_name'] = $user->name;
            }

            $response = response()->json($responseData, 201);

            return $response->header('Access-Control-Allow-Origin', '*')
                          ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                          ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Walk-in appointment validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            
            $response = response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Walk-in appointment creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            $response = response()->json([
                'status' => false,
                'message' => 'Failed to create walk-in appointment',
                'error' => $e->getMessage()
            ], 500);
        }

        return $response->header('Access-Control-Allow-Origin', '*')
                      ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                      ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    /**
     * Reschedule any appointment (admin function)
     */
    public function rescheduleAppointment(Request $request, $id)
    {
        try {
            // Find the appointment (not restricted to user ownership)
            $appointment = Appointment::findOrFail($id);
            
            // Only allow rescheduling of pending and confirmed appointments
            if (!in_array($appointment->status, ['pending', 'confirmed'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Only pending and confirmed appointments can be rescheduled'
                ], 400)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }

            // Validate the request
            $validatedData = $request->validate([
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|string',
            ]);

            // Check if the selected date is not Sunday
            $selectedDate = new \DateTime($validatedData['appointment_date']);
            if ($selectedDate->format('w') == 0) { // 0 = Sunday
                return response()->json([
                    'status' => false,
                    'message' => 'Appointments cannot be scheduled on Sundays'
                ], 422)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }

            // Log the reschedule action
            \Log::info('Admin rescheduling appointment', [
                'appointment_id' => $id,
                'admin_user' => $request->user()->name,
                'old_date' => $appointment->appointment_date,
                'old_time' => $appointment->appointment_time,
                'new_date' => $validatedData['appointment_date'],
                'new_time' => $validatedData['appointment_time'],
                'customer' => $appointment->user->name ?? 'Unknown'
            ]);

            // Update appointment
            $appointment->update([
                'appointment_date' => $validatedData['appointment_date'],
                'appointment_time' => $validatedData['appointment_time'],
            ]);
            
            // Load relationships for response
            $appointment->load(['user', 'pets', 'services']);

            return response()->json([
                'status' => true,
                'message' => 'Appointment rescheduled successfully',
                'appointment' => $appointment
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Appointment not found'
            ], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        } catch (\Exception $e) {
            \Log::error('Admin appointment reschedule failed', [
                'appointment_id' => $id,
                'error' => $e->getMessage(),
                'admin_user' => $request->user()->name ?? 'Unknown'
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to reschedule appointment',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
    }

    /**
     * Get all customers (non-staff users) with their pets and appointment history
     */
    public function getAllCustomers(Request $request)
    {
        try {
            // Get all non-staff users (customers only)
            $customers = User::where('role', 'user')
                ->with([
                    'appointments' => function ($query) {
                        $query->with(['pets', 'services'])
                              ->orderBy('appointment_date', 'desc');
                    }
                ])
                ->orderBy('name')
                ->get();

            // Group pets by customer and include appointment history for each pet
            $customersWithPetHistory = $customers->map(function ($customer) {
                // Get all unique pets from appointments
                $allPets = collect();
                
                foreach ($customer->appointments as $appointment) {
                    foreach ($appointment->pets as $pet) {
                        // Check if we already have this pet (by name and type)
                        $existingPet = $allPets->first(function ($existingPet) use ($pet) {
                            return $existingPet['name'] === $pet->name && 
                                   $existingPet['type'] === $pet->type &&
                                   $existingPet['breed'] === $pet->breed;
                        });

                        if (!$existingPet) {
                            // Add new pet with its appointment history
                            $petAppointments = $customer->appointments->filter(function ($appointment) use ($pet) {
                                return $appointment->pets->contains(function ($appointmentPet) use ($pet) {
                                    return $appointmentPet->name === $pet->name && 
                                           $appointmentPet->type === $pet->type &&
                                           $appointmentPet->breed === $pet->breed;
                                });
                            })->values();

                            $allPets->push([
                                'id' => $pet->id,
                                'name' => $pet->name,
                                'type' => $pet->type,
                                'breed' => $pet->breed,
                                'appointments' => $petAppointments->map(function ($appointment) {
                                    return [
                                        'id' => $appointment->id,
                                        'appointment_date' => $appointment->appointment_date,
                                        'appointment_time' => $appointment->appointment_time,
                                        'status' => $appointment->status,
                                        'services' => $appointment->services->pluck('name'),
                                        'notes' => $appointment->notes,
                                        'created_at' => $appointment->created_at
                                    ];
                                })
                            ]);
                        }
                    }
                }

                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'email_verified_at' => $customer->email_verified_at,
                    'created_at' => $customer->created_at,
                    'total_appointments' => $customer->appointments->count(),
                    'last_appointment' => $customer->appointments->first()?->appointment_date,
                    'pets' => $allPets
                ];
            });

            return response()->json([
                'status' => true,
                'customers' => $customersWithPetHistory
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        } catch (\Exception $e) {
            \Log::error('Failed to fetch customers', [
                'error' => $e->getMessage(),
                'admin_user' => $request->user()->name ?? 'Unknown'
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch customers',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
    }
}
