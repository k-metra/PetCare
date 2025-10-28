<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

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
            return redirect(config('app.frontend_url', 'http://localhost:3000') . '/email/verified?status=user_not_found');
        }

        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return redirect(config('app.frontend_url', 'http://localhost:3000') . '/email/verified?status=invalid_link');
        }


        if ($user->hasVerifiedEmail()) {
            return redirect(config('app.frontend_url', 'http://localhost:3000') . '/email/verified?status=already_verified');
        }

        $user->markEmailAsVerified();


        return redirect(config('app.frontend_url', 'http://localhost:3000') . '/email/verified?status=success');
    }

    public function resendEmailVerification(Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['status' => true, 'message' => 'Verification link sent! Please check your email.'], 200);
    }

    public function resendEmailVerificationByEmail(Request $request) {
        $validatedData = $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $validatedData['email'])->first();

        if (!$user) {
            $response = response()->json(['status' => false, 'message' => 'User not found.'], 404);
        } else if ($user->hasVerifiedEmail()) {
            $response = response()->json(['status' => false, 'message' => 'Email is already verified.'], 400);
        } else {
            $user->sendEmailVerificationNotification();
            $response = response()->json(['status' => true, 'message' => 'Verification link sent! Please check your email.'], 200);
        }

        return $response->header('Access-Control-Allow-Origin', '*')
                      ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                      ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Logout failed', 
                'error' => $e->getMessage()
            ], 500);
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
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Logout from all devices failed', 
                'error' => $e->getMessage()
            ], 500);
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
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to get user info',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send password reset link to user's email
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }

            // Send password reset link
            $status = Password::sendResetLink(
                $request->only('email')
            );

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'status' => true,
                    'message' => 'Password reset link sent to your email address.'
                ], 200)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }

            return response()->json([
                'status' => false,
                'message' => 'Unable to send password reset link. Please try again.'
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to send password reset link',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
    }

    /**
     * Reset user's password
     */
    public function resetPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required',
                'email' => 'required|email',
                'password' => 'required|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }

            // Reset the password
            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ])->setRememberToken(Str::random(60));

                    $user->save();

                    event(new PasswordReset($user));
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'status' => true,
                    'message' => 'Password has been successfully reset. You can now log in with your new password.'
                ], 200)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }

            // Handle different error cases
            $message = match($status) {
                Password::INVALID_TOKEN => 'The password reset token is invalid or has expired.',
                Password::INVALID_USER => 'We could not find a user with that email address.',
                default => 'Unable to reset password. Please try again.'
            };

            return response()->json([
                'status' => false,
                'message' => $message
            ], 400)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
    }
}
