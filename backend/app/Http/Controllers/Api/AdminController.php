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
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve appointments',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update appointment status',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update user role',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve dashboard statistics',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
                ], 400)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            }

            // Delete related records first (due to foreign key constraints)
            // Note: Laravel will handle cascade deletes if properly set up in migrations
            $appointment->delete();

            return response()->json([
                'status' => true,
                'message' => 'Appointment deleted successfully'
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Appointment not found'
            ], 404)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete appointment',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve analytics data',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve recent appointments',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }
}
