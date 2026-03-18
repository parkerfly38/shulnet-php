<?php

namespace App\Http\Controllers;

use App\Models\DeviceToken;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Register a device token
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'device_type' => 'required|in:ios,android,web',
            'device_name' => 'nullable|string|max:255',
            'app_version' => 'nullable|string|max:50',
        ]);

        $user = $request->user();

        // Check if token already exists
        $deviceToken = DeviceToken::where('token', $validated['token'])->first();

        if ($deviceToken) {
            // Update existing token
            $deviceToken->update([
                'user_id' => $user->id,
                'device_name' => $validated['device_name'] ?? $deviceToken->device_name,
                'app_version' => $validated['app_version'] ?? $deviceToken->app_version,
                'is_active' => true,
                'last_used_at' => now(),
            ]);
        } else {
            // Create new token
            $deviceToken = DeviceToken::create([
                'user_id' => $user->id,
                'token' => $validated['token'],
                'device_type' => $validated['device_type'],
                'device_name' => $validated['device_name'],
                'app_version' => $validated['app_version'],
                'last_used_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Device token registered successfully',
            'device_token' => $deviceToken,
        ]);
    }

    /**
     * Unregister a device token
     */
    public function unregister(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $user = $request->user();

        DeviceToken::where('user_id', $user->id)
            ->where('token', $validated['token'])
            ->update(['is_active' => false]);

        return response()->json([
            'message' => 'Device token unregistered successfully',
        ]);
    }

    /**
     * Get user's device tokens
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $tokens = $user->deviceTokens()
            ->orderBy('last_used_at', 'desc')
            ->get();

        return response()->json([
            'device_tokens' => $tokens,
        ]);
    }
}
