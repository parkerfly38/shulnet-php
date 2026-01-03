<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipTier extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'billing_period',
        'max_members',
        'is_active',
        'sort_order',
        'features',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'max_members' => 'integer',
        'sort_order' => 'integer',
        'features' => 'array',
    ];

    /**
     * Get the membership periods using this tier.
     */
    public function membershipPeriods(): HasMany
    {
        return $this->hasMany(MembershipPeriod::class);
    }

    /**
     * Scope to get only active tiers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
