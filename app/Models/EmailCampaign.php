<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EmailCampaign extends Model
{
    protected $fillable = [
        'name',
        'description',
        'subject',
        'content',
        'opt_in_type', // 'single' or 'double'
        'is_active',
        'confirmation_subject',
        'confirmation_content',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all members subscribed to this campaign
     */
    public function subscribers(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'campaign_subscriptions')
            ->withPivot('status', 'confirmation_token', 'confirmed_at', 'unsubscribed_at')
            ->withTimestamps();
    }

    /**
     * Get confirmed subscribers only
     */
    public function confirmedSubscribers(): BelongsToMany
    {
        return $this->subscribers()->wherePivot('status', 'confirmed');
    }

    /**
     * Get pending subscribers (double opt-in not confirmed yet)
     */
    public function pendingSubscribers(): BelongsToMany
    {
        return $this->subscribers()->wherePivot('status', 'pending');
    }
}
