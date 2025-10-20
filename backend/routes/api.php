<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AdminController;

Route::post('/register', [UserController::class, 'register']);

Route::post('/login', [UserController::class, 'login']);

Route::get('/email/verify', [UserController::class, 'verifyEmail'])->middleware('auth:sanctum')->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', [UserController::class, 'emailVerificationRequest'])->middleware(['signed'])->name('verification.verify');

Route::post('/email/verification-notification', [UserController::class, 'resendEmailVerification'])->middleware(['throttle:6,1'])->name('verification.send');

// Protected authentication routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::post('/logout-all', [UserController::class, 'logoutAll']);
    Route::get('/user', [UserController::class, 'user']);
});

// Protected appointment routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/services', [AppointmentController::class, 'getServices']);
});

// Admin/Staff routes (require staff or admin role)
Route::middleware(['auth:sanctum', 'role:staff,admin'])->group(function () {
    Route::get('/admin/appointments', [AdminController::class, 'getAllAppointments']);
    Route::put('/admin/appointments/{id}/status', [AdminController::class, 'updateAppointmentStatus']);
    Route::get('/admin/dashboard', [AdminController::class, 'getDashboardStats']);
});

// Admin only routes (require admin role)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
    Route::put('/admin/users/{id}/role', [AdminController::class, 'updateUserRole']);
});