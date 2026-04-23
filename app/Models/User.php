<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'roles',
        'is_default_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_default_admin' => 'boolean',
        ];
    }

    /**
     * Get the member associated with this user.
     */
    public function member(): HasOne
    {
        return $this->hasOne(Member::class, 'user_id');
    }

    /**
     * Check if the user can be a default admin (must have admin role).
     */
    public function canBeDefaultAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Set this user as the default admin.
     * Only users with admin role can be set as default admin.
     */
    public function setAsDefaultAdmin(): bool
    {
        if (! $this->canBeDefaultAdmin()) {
            return false;
        }

        // Remove default admin status from all other users
        static::where('id', '!=', $this->id)->update(['is_default_admin' => false]);

        // Set this user as default admin
        $this->update(['is_default_admin' => true]);

        return true;
    }

    /**
     * Remove default admin status from this user.
     */
    public function removeDefaultAdmin(): void
    {
        $this->update(['is_default_admin' => false]);
    }

    /**
     * Get the default admin user.
     */
    public static function getDefaultAdmin(): ?self
    {
        return static::where('is_default_admin', true)->first();
    }

    public function deviceTokens(): HasMany
    {
        return $this->hasMany(DeviceToken::class);
    }

    public function activeDeviceTokens(): HasMany
    {
        return $this->hasMany(DeviceToken::class)->where('is_active', true);
    }

    /**
     * Get the user's active role from session
     * Defaults to the highest priority role if not set
     */
    public function getActiveRole(): \App\Enums\UserRole
    {
        $sessionRole = session('active_role');
        
        if ($sessionRole && $this->hasRole($sessionRole)) {
            return \App\Enums\UserRole::from($sessionRole);
        }

        // Default priority: Admin > Member > Teacher > Parent > Student
        $roles = $this->roles ?? [];
        
        if (empty($roles)) {
            return \App\Enums\UserRole::Member; // Default fallback
        }

        // Return highest priority role
        $priorityOrder = [
            \App\Enums\UserRole::Admin,
            \App\Enums\UserRole::Member,
            \App\Enums\UserRole::Teacher,
            \App\Enums\UserRole::Parent,
            \App\Enums\UserRole::Student,
        ];

        foreach ($priorityOrder as $role) {
            if ($this->hasRole($role)) {
                return $role;
            }
        }

        return $roles[0];
    }

    /**
     * Check if user has multiple roles (can switch between dashboards)
     */
    public function hasMultipleRoles(): bool
    {
        $roles = $this->roles ?? [];
        return count($roles) > 1;
    }

    /**
     * Check if user can switch to a specific role
     */
    public function canSwitchToRole(\App\Enums\UserRole|string $role): bool
    {
        return $this->hasRole($role) && $this->hasMultipleRoles();
    }
}
