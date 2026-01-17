<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @group Authentication
 *
 * @authenticated
 */
class TokenController extends Controller
{
    /**
     * Create API Token
     *
     * Generate a new API token for server-to-server authentication.
     *
     * @unauthenticated
     */
    public function create(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'token_name' => 'required|string|max:255',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user has admin role
        if (! $user->hasRole('admin')) {
            throw ValidationException::withMessages([
                'email' => ['Only admin users can create API tokens.'],
            ]);
        }

        $token = $user->createToken($request->token_name);

        return response()->json([
            'message' => 'API token created successfully',
            'data' => [
                'token' => $token->plainTextToken,
                'token_name' => $request->token_name,
            ],
        ], 201);
    }

    /**
     * List API Tokens
     *
     * Get all API tokens for the authenticated user.
     */
    public function index(Request $request)
    {
        $tokens = $request->user()->tokens;

        return response()->json([
            'message' => 'API tokens retrieved successfully',
            'data' => $tokens->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'last_used_at' => $token->last_used_at,
                    'created_at' => $token->created_at,
                ];
            }),
        ]);
    }

    /**
     * Revoke API Token
     *
     * Delete a specific API token by ID.
     */
    public function destroy(Request $request, $tokenId)
    {
        $token = $request->user()->tokens()->where('id', $tokenId)->first();

        if (! $token) {
            return response()->json([
                'message' => 'Token not found',
            ], 404);
        }

        $tokenName = $token->name;
        $token->delete();

        return response()->json([
            'message' => "API token '{$tokenName}' revoked successfully",
        ]);
    }

    /**
     * Revoke All API Tokens
     *
     * Delete all API tokens for the authenticated user.
     */
    public function destroyAll(Request $request)
    {
        $count = $request->user()->tokens()->count();
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => "{$count} API token(s) revoked successfully",
        ]);
    }

    /**
     * Show API Tokens Management Page
     *
     * Display the API tokens management UI.
     */
    public function page(Request $request)
    {
        $tokens = $request->user()->tokens()->get();

        return inertia('admin/api-tokens', [
            'tokens' => $tokens->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'last_used_at' => $token->last_used_at,
                    'created_at' => $token->created_at,
                ];
            }),
        ]);
    }
}
