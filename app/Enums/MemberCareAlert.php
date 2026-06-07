<?php

namespace App\Enums;

enum MemberCareAlert: string
{
    case Hospitalized = 'hospitalized';
    case Mourning = 'mourning';
    case ImmediateFollowUp = 'immediate_follow_up';
    case OtherEmergency = 'other_emergency';

    /**
     * Get all alert values as an array
     */
    public static function values(): array
    {
        return array_map(fn ($alert) => $alert->value, self::cases());
    }

    /**
     * Get a human-readable label for the alert
     */
    public function label(): string
    {
        return match ($this) {
            self::Hospitalized => 'Hospitalized',
            self::Mourning => 'Mourning',
            self::ImmediateFollowUp => 'Immediate Follow-Up',
            self::OtherEmergency => 'Other Emergency',
        };
    }

    /**
     * Get all alerts as label-value pairs
     */
    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $alert) {
            $options[$alert->value] = $alert->label();
        }

        return $options;
    }
}
