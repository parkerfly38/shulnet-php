<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Display a listing of users with their roles.
     */
    public function index()
    {
        $users = User::with([])
            ->select(['id', 'name', 'email', 'roles'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles ? array_map(fn($role) => $role->value, $user->roles) : [],
                    'role_labels' => $user->role_labels,
                    'is_admin' => $user->isAdmin(),
                    'is_teacher' => $user->isTeacher(),
                    'is_parent' => $user->isParent(),
                    'is_student' => $user->isStudent(),
                ];
            });

        return response()->json([
            'users' => $users,
            'available_roles' => UserRole::options()
        ]);
    }

    /**
     * Update user roles.
     */
    public function updateRoles(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'in:' . implode(',', UserRole::values())
        ]);

        $roles = array_map(fn($role) => UserRole::from($role), $request->roles);
        $user->setRoles($roles);

        return response()->json([
            'message' => 'Roles updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'roles' => array_map(fn($role) => $role->value, $user->roles),
                'role_labels' => $user->role_labels
            ]
        ]);
    }

    /**
     * Add a role to a user.
     */
    public function addRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:' . implode(',', UserRole::values())
        ]);

        $role = UserRole::from($request->role);
        
        if ($user->hasRole($role)) {
            return response()->json([
                'message' => 'User already has this role'
            ], 400);
        }

        $user->addRole($role);

        return response()->json([
            'message' => "Role '{$role->label()}' added successfully",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'roles' => array_map(fn($r) => $r->value, $user->roles),
                'role_labels' => $user->role_labels
            ]
        ]);
    }

    /**
     * Remove a role from a user.
     */
    public function removeRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:' . implode(',', UserRole::values())
        ]);

        $role = UserRole::from($request->role);
        
        if (!$user->hasRole($role)) {
            return response()->json([
                'message' => 'User does not have this role'
            ], 400);
        }

        $user->removeRole($role);

        return response()->json([
            'message' => "Role '{$role->label()}' removed successfully",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'roles' => $user->roles ? array_map(fn($r) => $r->value, $user->roles) : [],
                'role_labels' => $user->role_labels
            ]
        ]);
    }

    /**
     * Get users by role.
     */
    public function getUsersByRole(Request $request)
    {
        $request->validate([
            'role' => 'required|in:' . implode(',', UserRole::values())
        ]);

        $role = UserRole::from($request->role);
        $users = User::withRole($role)->get(['id', 'name', 'email', 'roles']);

        return response()->json([
            'role' => $role->value,
            'role_label' => $role->label(),
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_labels' => $user->role_labels
                ];
            })
        ]);
    }

    /**
     * Check if current user can perform admin actions.
     */
    public function checkAdminAccess(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'can_admin' => $user->isAdmin(),
            'can_teach' => $user->isTeacher(),
            'roles' => $user->roles ? array_map(fn($role) => $role->value, $user->roles) : []
        ]);
    }

    /**
     * Admin-only: Get paginated list of all users with their roles.
     */
    public function adminUserList(Request $request)
    {
        // This route should be protected by admin middleware
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $roleFilter = $request->get('role');

        $query = User::query()
            ->select(['id', 'name', 'email', 'roles', 'created_at', 'updated_at'])
            ->orderBy('created_at', 'desc');

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if ($roleFilter && in_array($roleFilter, UserRole::values())) {
            $query->withRole(UserRole::from($roleFilter));
        }

        $users = $query->paginate($perPage);

        // Transform user data
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles ? array_map(fn($role) => $role->value, $user->roles) : [],
                'role_labels' => $user->role_labels,
                'is_admin' => $user->isAdmin(),
                'is_teacher' => $user->isTeacher(),
                'is_parent' => $user->isParent(),
                'is_student' => $user->isStudent(),
                'is_member' => $user->isMember(),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'users' => $users,
            'available_roles' => UserRole::options(),
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
            ]
        ]);
    }
}