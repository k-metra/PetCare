<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;

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
}
