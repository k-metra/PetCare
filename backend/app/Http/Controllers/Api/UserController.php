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
            return response()->json(['status' => false, 'message' => 'Invalid email or password.'], 401)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }

        $user = Auth::user();

        if (!$user->hasVerifiedEmail()) {
            return response()->json(['status' => false, 'message' => 'Email not verified. Please verify your email before logging in.'], 403)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['status' => true, 'message' => 'Login successful', 'access_token' => $token, 'token_type' => 'Bearer', 'user' => $user], 200)
            ->header('Access-Control-Allow-Origin', 'https://pet-care-pwi29pk2b-k-metras-projects.vercel.app')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
            return response()->json(['status' => true, 'message' => 'User registered successfully', 'user' => $user], 201)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'User registration failed', 'error' => $e->getMessage()], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }

    public function verifyEmail(Request $request) {
        return response()->json(['status' => true, 'message' => 'Email verification link sent! Please check your email.'], 200)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
        return response()->json(['status' => true, 'message' => 'Verification link sent! Please check your email.'], 200)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    /**
     * Logout user and revoke tokens
     */
    public function logout(Request $request) {
        try {
            // Revoke current token
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'status' => true, 
                'message' => 'Logout successful'
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        } catch (\Exception $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Logout failed', 
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }

    /**
     * Logout from all devices by revoking all tokens
     */
    public function logoutAll(Request $request) {
        try {
            // Revoke all tokens for the user
            $request->user()->tokens()->delete();
            
            return response()->json([
                'status' => true, 
                'message' => 'Logout from all devices successful'
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        } catch (\Exception $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Logout from all devices failed', 
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }

    /**
     * Get current authenticated user info
     */
    public function user(Request $request) {
        try {
            return response()->json([
                'status' => true,
                'user' => $request->user()
            ], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to get user info',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }
}
