<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolTuitionTier extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'billing_period',
        'max_students',
        'is_active',
        'sort_order',
        'features',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'max_students' => 'integer',
        'sort_order' => 'integer',
        'features' => 'array',
    ];

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
