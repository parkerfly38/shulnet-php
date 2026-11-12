<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
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
                'roles' => $user->roles ? array_map(fn ($role) => $role->value, $user->roles) : [],
                'role_labels' => $user->role_labels,
                'is_admin' => $user->isAdmin(),
                'is_teacher' => $user->isTeacher(),
                'is_parent' => $user->isParent(),
                'is_student' => $user->isStudent(),
                'is_member' => $user->isMember(),
                'is_default_admin' => $user->is_default_admin,
                'two_factor_enabled' => $user->hasEnabledTwoFactorAuthentication(),
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
            'roles.*' => 'in:'.implode(',', UserRole::values()),
        ]);

        $roles = array_map(fn ($role) => UserRole::from($role), $request->roles);
        $user->setRoles($roles);
        $user->save();

        return response()->json([
            'message' => 'User roles updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles ? array_map(fn ($role) => $role->value, $user->roles) : [],
                'role_labels' => $user->role_labels,
            ],
        ]);
    }

    /**
     * Email the user the standard "reset your password" link.
     */
    public function sendPasswordResetLink(Request $request, User $user)
    {
        try {
            $status = Password::sendResetLink(['email' => $user->email]);
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', "The reset email to {$user->email} could not be sent. Check the email settings, or set a password instead.");
        }

        if ($status !== Password::RESET_LINK_SENT) {
            // Usually throttling: a link was sent to this address within the last minute.
            return back()->with('error', __($status));
        }

        Log::info('Admin sent password reset link', ['admin_id' => $request->user()->id, 'user_id' => $user->id]);

        return back()->with('success', "A password reset link was emailed to {$user->email}.");
    }

    /**
     * Set a new password for the user and sign them out everywhere else.
     */
    public function setPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', 'string', PasswordRule::defaults(), 'confirmed'],
        ]);

        $user->forceFill([
            'password' => $validated['password'],
            'remember_token' => Str::random(60),
        ])->save();

        // End the user's existing sessions and API tokens so the old password stops working everywhere.
        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->when($user->is($request->user()), fn ($q) => $q->where('id', '!=', $request->session()->getId()))
                ->delete();
        }
        $user->tokens()->delete();

        Log::info('Admin set user password', ['admin_id' => $request->user()->id, 'user_id' => $user->id]);

        return back()->with('success', "The password for {$user->name} was changed. They have been signed out of other sessions.");
    }

    /**
     * Turn off two-factor authentication for a user who lost their authenticator app
     * and recovery codes. They sign in with just their password and can set it up again.
     */
    public function disableTwoFactor(Request $request, User $user, DisableTwoFactorAuthentication $disable)
    {
        if (! $user->hasEnabledTwoFactorAuthentication()) {
            return back()->with('error', "{$user->name} does not have two-factor authentication turned on.");
        }

        $disable($user);

        Log::info('Admin removed user two-factor authentication', ['admin_id' => $request->user()->id, 'user_id' => $user->id]);

        return back()->with('success', "Two-factor authentication was removed for {$user->name}. They can sign in with their password and set it up again under Settings.");
    }

    /**
     * Set user as default admin.
     */
    public function setDefaultAdmin(Request $request, User $user)
    {
        // Check if user can be default admin (must have admin role)
        if (! $user->canBeDefaultAdmin()) {
            return response()->json([
                'message' => 'User must have admin role to be set as default admin.',
            ], 422);
        }

        // Set as default admin (automatically removes from other users)
        $user->setAsDefaultAdmin();

        return response()->json([
            'message' => 'User set as default admin successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_default_admin' => true,
            ],
        ]);
    }
}
