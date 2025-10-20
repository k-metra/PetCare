<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function login(Request $request) {
        //
        $validatedData = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($validatedData)) {
            return response()->json(['status' => false, 'message' => 'Invalid email or password.'], 401);
        }

        $user = Auth::user();

        if (!$user->hasVerifiedEmail()) {
            return response()->json(['status' => false, 'message' => 'Email not verified. Please verify your email before logging in.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['status' => true, 'message' => 'Login successful', 'access_token' => $token, 'token_type' => 'Bearer', 'user' => $user], 200);
    }

    public function register(Request $request) {
        try {
            $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            ]);

            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => bcrypt($validatedData['password']),
            ]);

            event(new Registered($user));
            return response()->json(['status' => true, 'message' => 'User registered successfully', 'user' => $user], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'User registration failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function verifyEmail(Request $request) {
        return response()->json(['status' => true, 'message' => 'Email verification link sent! Please check your email.'], 200);
    }

    public function emailVerificationRequest(Request $request, $id, $hash) {
        //
        $user = User::findOrFail($id);

        if (! $user) {
            return redirect('http://localhost:3000/email/verified?status=user_not_found');
        }

        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return redirect('http://localhost:3000/email/verified?status=invalid_link');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect('http://localhost:3000/email/verified?status=already_verified');
        }

        $user->markEmailAsVerified();


        return redirect('http://localhost:3000/email/verified?status=success');
    }

    public function resendEmailVerification(Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['status' => true, 'message' => 'Verification link sent! Please check your email.'], 200);
    }
}
