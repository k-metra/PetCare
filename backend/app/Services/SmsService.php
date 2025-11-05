<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send SMS using Movider API (Philippine SMS service)
     * To use this service:
     * 1. Sign up at https://movider.co/
     * 2. Get your API key from the dashboard
     * 3. Add MOVIDER_API_KEY to your .env file
     * 4. Set SMS_ENABLED=true in .env
     */
    public function sendSms($phoneNumber, $message)
    {
        Log::info("SMS Service called", [
            'phone' => $phoneNumber,
            'sms_enabled' => config('services.sms.enabled', false),
            'has_api_key' => !empty(config('services.sms.movider_api_key'))
        ]);

        // Check if SMS is enabled in environment
        if (!config('services.sms.enabled', false)) {
            Log::info("SMS disabled. Would send to {$phoneNumber}: {$message}");
            return [
                'success' => true,
                'message' => 'SMS disabled in environment (development mode)',
                'debug_code' => $this->extractCodeFromMessage($message)
            ];
        }

        $apiKey = config('services.sms.movider_api_key');
        
        if (!$apiKey) {
            Log::error('Movider API key not configured');
            return [
                'success' => false,
                'message' => 'SMS service not configured'
            ];
        }

        try {
            // Format phone number for Movider (should be in 09xxxxxxxxx format)
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);
            
            // Configure HTTP client to handle SSL properly on Windows
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for development on Windows
                'timeout' => 30,
            ])->post('https://api.movider.co/v1/sms', [
                'apikey' => $apiKey,
                'to' => $formattedPhone,
                'message' => $message,  // Try 'message' instead of 'text'
                'from' => config('app.name', 'PetCare')
            ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info("SMS sent successfully to {$phoneNumber}", ['response' => $data]);
                
                return [
                    'success' => true,
                    'message' => 'SMS sent successfully',
                    'response' => $data
                ];
            } else {
                Log::error("SMS sending failed", [
                    'phone' => $phoneNumber,
                    'response' => $response->body(),
                    'status' => $response->status()
                ]);
                
                return [
                    'success' => false,
                    'message' => 'Failed to send SMS',
                    'error' => $response->body()
                ];
            }
        } catch (\Exception $e) {
            Log::error("SMS service error: " . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'SMS service error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Format Philippine phone number for Movider API
     */
    private function formatPhoneNumber($phoneNumber)
    {
        // Remove any spaces, dashes, or other characters
        $phone = preg_replace('/[^0-9+]/', '', $phoneNumber);
        
        // Convert different formats to 09xxxxxxxxx (Movider typically accepts this format)
        if (preg_match('/^09(\d{9})$/', $phone)) {
            // Already in 09xxxxxxxxx format
            return $phone;
        } elseif (preg_match('/^9(\d{9})$/', $phone, $matches)) {
            // 9xxxxxxxxx -> 09xxxxxxxxx
            return '09' . $matches[1];
        } elseif (preg_match('/^\+639(\d{9})$/', $phone, $matches)) {
            // +639xxxxxxxxx -> 09xxxxxxxxx
            return '09' . $matches[1];
        } elseif (preg_match('/^639(\d{9})$/', $phone, $matches)) {
            // 639xxxxxxxxx -> 09xxxxxxxxx
            return '09' . $matches[1];
        }
        
        // Return as-is if format is not recognized
        return $phone;
    }

    /**
     * Extract verification code from message for debugging
     */
    private function extractCodeFromMessage($message)
    {
        if (preg_match('/\b(\d{6})\b/', $message, $matches)) {
            return $matches[1];
        }
        return null;
    }
}