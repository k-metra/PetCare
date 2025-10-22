<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Headers
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = [
            'https://pet-care-pink-six.vercel.app',
            'https://pet-care-pwi29pk2b-k-metras-projects.vercel.app'
        ];
        
        $origin = $request->header('Origin');
        $allowOrigin = in_array($origin, $allowedOrigins) ? $origin : '*';
        
        return $next($request)
            ->header('Access-Control-Allow-Origin', $allowOrigin)
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
            ->header('Access-Control-Allow-Credentials', 'true');
    }
}
