<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\UserController;

Route::post('/register', [UserController::class, 'register']);

Route::post('/login', [UserController::class, 'login']);

Route::get('/email/verify', [UserController::class, 'verifyEmail'])->middleware('auth:sanctum')->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', [UserController::class, 'emailVerificationRequest'])->middleware(['signed'])->name('verification.verify');

Route::post('/email/verification-notification', [UserController::class, 'resendEmailVerification'])->middleware(['throttle:6,1'])->name('verification.send');