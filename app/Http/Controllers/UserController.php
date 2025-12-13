<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if ($request->filled('role')) {
            $role = $request->get('role');
            $query->whereJsonContains('roles', $role);
        }

        $users = $query->paginate(15)->through(function ($user) {
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
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];
        });

        $availableRoles = collect(UserRole::cases())->mapWithKeys(function ($role) {
            return [$role->value => $role->label()];
        })->toArray();

        return Inertia::render('admin/users', [
            'users' => $users,
            'available_roles' => $availableRoles,
            'filters' => [
                'search' => $request->get('search'),
                'role' => $request->get('role'),
            ],
        ]);
    }

    /**
     * Update user roles via API.
     */
    public function updateRoles(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'in:' . implode(',', UserRole::values())
        ]);

        $roles = array_map(fn($role) => UserRole::from($role), $request->roles);
        $user->setRoles($roles);
        $user->save();

        return response()->json([
            'message' => 'User roles updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles ? array_map(fn($role) => $role->value, $user->roles) : [],
                'role_labels' => $user->role_labels,
            ]
        ]);
    }
}