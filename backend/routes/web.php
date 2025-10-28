<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// This route exists for Laravel's password reset system compatibility
// but our custom notification goes directly to the frontend
Route::get('/password/reset/{token}', function ($token) {
    $email = request()->query('email');
    $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
    return redirect("{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($email));
})->name('password.reset');