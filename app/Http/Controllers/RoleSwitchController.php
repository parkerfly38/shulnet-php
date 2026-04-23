<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class RoleSwitchController extends Controller
{
    /**
     * Switch the user's active role
     */
    public function switch(Request $request)
    {
        $request->validate([
            'role' => 'required|string|in:admin,member,teacher,parent,student',
        ]);

        $user = $request->user();
        $requestedRole = UserRole::from($request->input('role'));

        // Verify user has the requested role
        if (!$user->hasRole($requestedRole)) {
            return response()->json([
                'message' => 'You do not have permission to switch to this role.',
            ], 403);
        }

        // Store the active role in session
        Session::put('active_role', $requestedRole->value);

        // Redirect to the appropriate dashboard based on the role
        return $this->redirectToDashboard($requestedRole);
    }

    /**
     * Get the user's available roles for switching
     */
    public function availableRoles(Request $request)
    {
        $user = $request->user();
        $roles = $user->roles ?? [];

        return response()->json([
            'roles' => array_map(fn($role) => [
                'value' => $role->value,
                'label' => ucfirst($role->value),
            ], $roles),
            'active_role' => $user->getActiveRole()->value,
        ]);
    }

    /**
     * Redirect to the appropriate dashboard based on role
     */
    private function redirectToDashboard(UserRole $role)
    {
        return match($role) {
            UserRole::Admin => redirect()->route('dashboard'),
            UserRole::Member => redirect()->route('member.dashboard'),
            UserRole::Teacher => redirect()->route('dashboard'),
            UserRole::Parent => redirect()->route('dashboard'),
            UserRole::Student => redirect()->route('dashboard'),
        };
    }
}
