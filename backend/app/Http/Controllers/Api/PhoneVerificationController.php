<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class PhoneVerificationController extends Controller
{
    protected $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }
    /**
     * Send phone verification code via SMS
     */
    public function sendVerificationCode(Request $request)
    {
        try {
            $request->validate([
                'phone_number' => [
                    'required',
                    'string',
                    function ($attribute, $value, $fail) {
                        // Philippine phone number validation
                        $patterns = [
                            '/^09\d{9}$/',           // 09xxxxxxxxx (11 digits)
                            '/^\+639\d{9}$/',        // +639xxxxxxxxx
                            '/^639\d{9}$/',          // 639xxxxxxxxx
                            '/^9\d{9}$/',            // 9xxxxxxxxx (10 digits)
                        ];
                        
                        $isValid = false;
                        foreach ($patterns as $pattern) {
                            if (preg_match($pattern, $value)) {
                                $isValid = true;
                                break;
                            }
                        }
                        
                        if (!$isValid) {
                            $fail('Please enter a valid Philippine phone number (e.g., 09xxxxxxxxx, +639xxxxxxxxx).');
                        }
                    },
                    Rule::unique('users', 'phone_number')->ignore($request->user()->id),
                ],
            ]);

            $user = $request->user();
            
            // Update phone number if provided
            if ($request->phone_number !== $user->phone_number) {
                $user->update(['phone_number' => $request->phone_number]);
            }

            // Generate verification code
            $code = $user->generatePhoneVerificationCode();

            // Send SMS with verification code
            $message = "Your PetCare verification code is: {$code}. This code will expire in 10 minutes.";
            $smsResult = $this->smsService->sendSms($user->phone_number, $message);

            // Log the attempt
            Log::info('Phone verification code sent to user ' . $user->id, [
                'phone' => $user->phone_number,
                'sms_success' => $smsResult['success'],
                'sms_message' => $smsResult['message']
            ]);

            $response = [
                'status' => true,
                'message' => $smsResult['success'] 
                    ? 'Verification code sent successfully to your phone number.'
                    : 'Code generated, but SMS sending failed. Check console for debug code.',
                'expires_in_minutes' => 10,
            ];

            // Include debug information in development, if SMS failed, or if SMS is disabled
            if (config('app.debug') || !$smsResult['success'] || !config('services.sms.enabled', false)) {
                $response['debug'] = [
                    'code' => $code,
                    'sms_result' => $smsResult
                ];
            }

            return response()->json($response, 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to send phone verification code', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to send verification code. Please try again.',
            ], 500);
        }
    }

    /**
     * Verify phone number with the provided code
     */
    public function verifyCode(Request $request)
    {
        try {
            $request->validate([
                'verification_code' => 'required|string|size:6',
            ]);

            $user = $request->user();
            
            // Add debugging
            Log::info('Phone verification attempt', [
                'user_id' => $user->id,
                'provided_code' => $request->verification_code,
                'stored_code' => $user->phone_verification_code,
                'expires_at' => $user->phone_verification_expires_at,
                'is_future' => $user->phone_verification_expires_at?->isFuture(),
                'current_time' => now(),
            ]);
            
            if ($user->verifyPhone($request->verification_code)) {
                return response()->json([
                    'status' => true,
                    'message' => 'Phone number verified successfully!',
                    'phone_verified_at' => $user->fresh()->phone_verified_at,
                ], 200);
            }

            return response()->json([
                'status' => false,
                'message' => 'Invalid or expired verification code.',
            ], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to verify phone number', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to verify phone number. Please try again.',
            ], 500);
        }
    }

    /**
     * Get current phone verification status
     */
    public function getVerificationStatus(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'status' => true,
            'data' => [
                'phone_number' => $user->phone_number,
                'is_verified' => $user->hasVerifiedPhone(),
                'verified_at' => $user->phone_verified_at,
            ],
        ], 200);
    }

    /**
     * Send SMS (placeholder for actual SMS service integration)
     * 
     * @param string $phoneNumber
     * @param string $message
     * @return bool
     */
    private function sendSMS(string $phoneNumber, string $message): bool
    {
        // TODO: Integrate with SMS service like Twilio, AWS SNS, etc.
        // Example with Twilio:
        /*
        try {
            $twilio = new Client(config('services.twilio.sid'), config('services.twilio.token'));
            
            $twilio->messages->create($phoneNumber, [
                'from' => config('services.twilio.from'),
                'body' => $message
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('SMS sending failed', ['error' => $e->getMessage()]);
            return false;
        }
        */
        
        return true; // Placeholder return
    }
}
