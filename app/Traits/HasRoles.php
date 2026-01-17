<?php

namespace App\Traits;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Casts\Attribute;

trait HasRoles
{
    /**
     * Get the user's roles as an array of UserRole enums
     */
    protected function roles(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (is_null($value)) {
                    return [];
                }

                $roleValues = json_decode($value, true) ?? [];

                return array_map(fn ($role) => UserRole::from($role), $roleValues);
            },
            set: function ($value) {
                if (is_null($value) || empty($value)) {
                    return null;
                }

                // Convert UserRole enums to their string values
                $roleValues = array_map(function ($role) {
                    return $role instanceof UserRole ? $role->value : $role;
                }, is_array($value) ? $value : [$value]);

                return json_encode(array_values(array_unique($roleValues)));
            }
        );
    }

    /**
     * Check if the user has a specific role
     */
    public function hasRole(UserRole|string $role): bool
    {
        $roleValue = $role instanceof UserRole ? $role->value : $role;
        $userRoles = array_map(fn ($r) => $r->value, $this->roles ?? []);

        return in_array($roleValue, $userRoles);
    }

    /**
     * Check if the user has any of the specified roles
     */
    public function hasAnyRole(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the user has all of the specified roles
     */
    public function hasAllRoles(array $roles): bool
    {
        foreach ($roles as $role) {
            if (! $this->hasRole($role)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Add a role to the user
     */
    public function addRole(UserRole|string $role): void
    {
        $roleValue = $role instanceof UserRole ? $role->value : $role;
        $currentRoles = $this->roles ?? [];
        $currentRoleValues = array_map(fn ($r) => $r->value, $currentRoles);

        if (! in_array($roleValue, $currentRoleValues)) {
            $currentRoleValues[] = $roleValue;
            $this->roles = array_map(fn ($r) => UserRole::from($r), $currentRoleValues);
            $this->save();
        }
    }

    /**
     * Remove a role from the user
     */
    public function removeRole(UserRole|string $role): void
    {
        $roleValue = $role instanceof UserRole ? $role->value : $role;
        $currentRoles = $this->roles ?? [];
        $currentRoleValues = array_map(fn ($r) => $r->value, $currentRoles);

        $newRoleValues = array_filter($currentRoleValues, fn ($r) => $r !== $roleValue);

        if (count($newRoleValues) !== count($currentRoleValues)) {
            $this->roles = empty($newRoleValues) ? null : array_map(fn ($r) => UserRole::from($r), array_values($newRoleValues));
            $this->save();
        }
    }

    /**
     * Set the user's roles, replacing any existing roles
     */
    public function setRoles(array $roles): void
    {
        $roleValues = array_map(function ($role) {
            return $role instanceof UserRole ? $role->value : $role;
        }, $roles);

        $this->roles = empty($roleValues) ? null : array_map(fn ($r) => UserRole::from($r), array_unique($roleValues));
        $this->save();
    }

    /**
     * Get role labels as a string
     */
    public function getRoleLabelsAttribute(): string
    {
        if (empty($this->roles)) {
            return 'No roles assigned';
        }

        return implode(', ', array_map(fn ($role) => $role->label(), $this->roles));
    }

    /**
     * Check if the user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::Admin);
    }

    /**
     * Check if the user is a teacher
     */
    public function isTeacher(): bool
    {
        return $this->hasRole(UserRole::Teacher);
    }

    /**
     * Check if the user is a parent
     */
    public function isParent(): bool
    {
        return $this->hasRole(UserRole::Parent);
    }

    /**
     * Check if the user is a student
     */
    public function isStudent(): bool
    {
        return $this->hasRole(UserRole::Student);
    }

    /**
     * Check if the user is a member
     */
    public function isMember(): bool
    {
        return $this->hasRole(UserRole::Member);
    }

    /**
     * Scope to filter users by role
     */
    public function scopeWithRole($query, UserRole|string $role)
    {
        $roleValue = $role instanceof UserRole ? $role->value : $role;

        return $query->whereJsonContains('roles', $roleValue);
    }

    /**
     * Scope to filter users with any of the specified roles
     */
    public function scopeWithAnyRole($query, array $roles)
    {
        $roleValues = array_map(function ($role) {
            return $role instanceof UserRole ? $role->value : $role;
        }, $roles);

        return $query->where(function ($q) use ($roleValues) {
            foreach ($roleValues as $role) {
                $q->orWhereJsonContains('roles', $role);
            }
        });
    }
}
