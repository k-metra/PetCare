<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MedicalRecordController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\Api\ContactFormController;

Route::post('/register', [UserController::class, 'register']);

Route::post('/login', [UserController::class, 'login']);

Route::get('/email/verify', [UserController::class, 'verifyEmail'])->middleware('auth:sanctum')->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', [UserController::class, 'emailVerificationRequest'])->middleware(['signed'])->name('verification.verify');

Route::post('/email/verification-notification', [UserController::class, 'resendEmailVerification'])->middleware(['throttle:6,1'])->name('verification.send');

Route::post('/email/resend-verification', [UserController::class, 'resendEmailVerificationByEmail'])->middleware(['throttle:6,1']);

// Password Reset routes
Route::post('/forgot-password', [UserController::class, 'forgotPassword'])->middleware(['throttle:5,1']);
Route::post('/reset-password', [UserController::class, 'resetPassword'])->middleware(['throttle:5,1']);

// Contact Form
Route::post('/contact', [ContactFormController::class, 'mail']);

// Protected authentication routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::post('/logout-all', [UserController::class, 'logoutAll']);
    Route::get('/user', [UserController::class, 'user']);
    
    // Account settings routes
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::put('/change-password', [UserController::class, 'changePassword']);
});

// Protected appointment routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::put('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    Route::get('/services', [AppointmentController::class, 'getServices']);
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableTimeSlots']);
    
    // Debug route to check appointment limits
    Route::get('/debug/appointments', function(Request $request) {
        $date = $request->get('date', now()->format('Y-m-d'));
        $time = $request->get('time', '9:00 AM');
        
        $maxAppointmentsPerSlot = config('appointments.max_appointments_per_slot', 3);
        $existingAppointments = \App\Models\Appointment::where('appointment_date', $date)
            ->where('appointment_time', $time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();
            
        $allAppointments = \App\Models\Appointment::where('appointment_date', $date)
            ->where('appointment_time', $time)
            ->with('user')
            ->get();
            
        return response()->json([
            'date' => $date,
            'time' => $time,
            'max_appointments_per_slot' => $maxAppointmentsPerSlot,
            'existing_appointments_count' => $existingAppointments,
            'appointments' => $allAppointments->map(function($apt) {
                return [
                    'id' => $apt->id,
                    'user' => $apt->user->name,
                    'status' => $apt->status,
                    'created_at' => $apt->created_at
                ];
            })
        ]);
    });
});

// Admin/Staff routes (require staff or admin role)
Route::middleware(['auth:sanctum', 'role:staff,admin'])->group(function () {
    Route::get('/admin/appointments', [AdminController::class, 'getAllAppointments']);
    Route::get('/admin/appointments/{id}', [AdminController::class, 'getAppointmentById']);
    Route::put('/admin/appointments/{id}/status', [AdminController::class, 'updateAppointmentStatus']);
    Route::put('/admin/appointments/{id}/reschedule', [AdminController::class, 'rescheduleAppointment']);
    Route::delete('/admin/appointments/{id}', [AdminController::class, 'deleteAppointment']);
    Route::post('/admin/appointments/complete', [AdminController::class, 'completeAppointment']);
    Route::post('/admin/walk-in-appointments', [AdminController::class, 'createWalkInAppointment']);
    Route::get('/admin/customers', [AdminController::class, 'getAllCustomers']);
    Route::get('/admin/dashboard', [AdminController::class, 'getDashboardStats']);
    Route::get('/admin/analytics', [AdminController::class, 'getAnalytics']);
    Route::get('/admin/recent-appointments', [AdminController::class, 'getRecentAppointments']);
    
    // Test route for debugging
    Route::post('/admin/test', function(Request $request) {
        return response()->json(['status' => true, 'message' => 'Test route works', 'user' => $request->user()]);
    });
    
    // Non-SSE notification routes
    Route::get('/admin/notifications', [NotificationController::class, 'getNotifications']);
    Route::delete('/admin/notifications', [NotificationController::class, 'clearNotifications']);
    
    // Medical Records routes
    Route::post('/medical-records', [MedicalRecordController::class, 'store']);
    Route::get('/medical-records', [MedicalRecordController::class, 'index']);
    Route::get('/medical-records/pet/{petId}', [MedicalRecordController::class, 'getPetRecords']);
    Route::get('/medical-records/search', [MedicalRecordController::class, 'search']);
    
    // Inventory Management routes
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::post('/products/{id}/quantity', [ProductController::class, 'updateQuantity']);
});

// Admin only routes (require admin role)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
    Route::put('/admin/users/{id}/role', [AdminController::class, 'updateUserRole']);
    
    // Staff Management routes
    Route::get('admin/staff', [StaffController::class, 'index']);
    Route::post('admin/staff', [StaffController::class, 'store']);
    Route::get('admin/staff/{id}', [StaffController::class, 'show']);
    Route::put('admin/staff/{id}', [StaffController::class, 'update']);
    Route::delete('admin/staff/{id}', [StaffController::class, 'destroy']);
});

// SSE endpoint (handles authentication manually due to SSE limitations)
Route::get('/admin/notifications/stream', [NotificationController::class, 'stream']);