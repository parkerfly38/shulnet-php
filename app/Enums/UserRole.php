<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Member = 'member';
    case Teacher = 'teacher';
    case Parent = 'parent';
    case Student = 'student';

    /**
     * Get all role values as an array
     */
    public static function values(): array
    {
        return array_map(fn($role) => $role->value, self::cases());
    }

    /**
     * Get a human-readable label for the role
     */
    public function label(): string
    {
        return match($this) {
            self::Admin => 'Administrator',
            self::Member => 'Member',
            self::Teacher => 'Teacher',
            self::Parent => 'Parent',
            self::Student => 'Student',
        };
    }

    /**
     * Get all roles as label-value pairs
     */
    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $role) {
            $options[$role->value] = $role->label();
        }
        return $options;
    }
}