<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotificationController extends Controller
{
    /**
     * Get notifications via simple HTTP polling (more efficient than SSE)
     */
    public function getNotifications(Request $request)
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['admin', 'staff'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $since = $request->query('since', 0);
        $notifications = Cache::get('admin_notifications', []);
        
        // Filter notifications newer than 'since' timestamp
        $newNotifications = array_filter($notifications, function($notification) use ($since) {
            return $notification['timestamp'] > $since;
        });

        return response()->json([
            'notifications' => array_values($newNotifications),
            'timestamp' => time()
        ]);
    }

    /**
     * Stream Server-Sent Events for admin/staff notifications (optimized)
     */
    public function stream(Request $request)
    {
        // Configure PHP for SSE
        ini_set('max_execution_time', 300); // 5 minutes instead of unlimited
        ini_set('memory_limit', '64M'); // Reduced memory limit
        
        // Get token from query parameter for SSE (since headers aren't supported)
        $token = $request->query('token');
        if (!$token) {
            return response('Unauthorized: No token', 401);
        }

        // Manually authenticate user using the token
        $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
        if (!$user || !in_array($user->role, ['admin', 'staff'])) {
            return response('Unauthorized', 403);
        }

        $response = new StreamedResponse(function () use ($user) {
            // Send initial connection confirmation
            echo "data: " . json_encode(['type' => 'connected', 'message' => 'Connected']) . "\n\n";
            flush();

            $lastCheck = time();
            $heartbeatInterval = 30; // Send heartbeat every 30 seconds
            $checkInterval = 5; // Check for notifications every 5 seconds instead of 2
            
            // Send existing notifications first
            $notifications = Cache::get('admin_notifications', []);
            if (!empty($notifications)) {
                // Send only the latest 5 notifications to avoid overwhelming
                $recentNotifications = array_slice($notifications, 0, 5);
                foreach ($recentNotifications as $notification) {
                    echo "data: " . json_encode($notification) . "\n\n";
                }
                flush();
            }

            $connectionStart = time();
            
            while (time() - $connectionStart < 300) { // 5 minutes max
                if (connection_aborted()) break;

                $currentTime = time();
                
                // Only check for new notifications every 5 seconds
                if ($currentTime - $lastCheck >= $checkInterval) {
                    $notifications = Cache::get('admin_notifications', []);
                    
                    // Only send notifications newer than last check
                    $newNotifications = array_filter($notifications, function($n) use ($lastCheck) {
                        return $n['timestamp'] > $lastCheck;
                    });

                    foreach ($newNotifications as $notification) {
                        echo "data: " . json_encode($notification) . "\n\n";
                    }
                    
                    if (!empty($newNotifications)) {
                        flush();
                    }
                    
                    $lastCheck = $currentTime;
                }

                // Send heartbeat less frequently
                if ($currentTime % $heartbeatInterval === 0) {
                    echo "data: " . json_encode(['type' => 'heartbeat']) . "\n\n";
                    flush();
                }

                // Sleep longer to reduce CPU usage
                sleep(1);
            }
            
            // Send reconnect signal after timeout
            echo "data: " . json_encode(['type' => 'reconnect', 'message' => 'Reconnecting...']) . "\n\n";
            flush();
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Connection', 'keep-alive');
        $response->headers->set('Access-Control-Allow-Origin', config('app.frontend_url'));
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Allow-Methods', 'GET');
        $response->headers->set('Access-Control-Allow-Headers', 'Cache-Control');

        return $response;
    }

    /**
     * Trigger a notification for admin/staff
     */
    public static function triggerNotification($type, $message, $data = [])
    {
        $notification = [
            'id' => Str::uuid(),
            'type' => $type,
            'message' => $message,
            'data' => $data,
            'timestamp' => time(),
            'created_at' => now()->toISOString()
        ];

        // Get existing notifications from cache
        $notifications = Cache::get('admin_notifications', []);
        
        // Add new notification
        $notifications[] = $notification;
        
        // Keep only last 50 notifications to prevent memory issues
        if (count($notifications) > 50) {
            $notifications = array_slice($notifications, -50);
        }
        
        // Store back in cache for 1 hour
        Cache::put('admin_notifications', $notifications, 3600);

        return $notification;
    }

    /**
     * Clear old notifications
     */
    public function clearNotifications(Request $request)
    {
        // Only allow admin/staff users
        if (!$request->user() || !in_array($request->user()->role, ['admin', 'staff'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Cache::forget('admin_notifications');

        return response()->json([
            'status' => true,
            'message' => 'Notifications cleared'
        ]);
    }
}