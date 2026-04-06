<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Banner extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'message',
        'type',
        'target_audience',
        'start_date',
        'end_date',
        'display_duration_seconds',
        'is_active',
        'is_dismissible',
        'show_on_login',
        'show_on_dashboard',
        'send_as_push_notification',
        'push_notification_sent_at',
        'push_notification_data',
        'action_url',
        'action_text',
        'view_count',
        'click_count',
        'dismiss_count',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'is_dismissible' => 'boolean',
        'show_on_login' => 'boolean',
        'show_on_dashboard' => 'boolean',
        'send_as_push_notification' => 'boolean',
        'push_notification_sent_at' => 'datetime',
        'push_notification_data' => 'array',
        'display_duration_seconds' => 'integer',
        'view_count' => 'integer',
        'click_count' => 'integer',
        'dismiss_count' => 'integer',
    ];

    /**
     * Get the user who created the banner.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get users who have interacted with this banner.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'banner_user')
            ->withPivot(['viewed', 'dismissed', 'clicked', 'viewed_at', 'dismissed_at', 'clicked_at'])
            ->withTimestamps();
    }

    /**
     * Scope to get only active banners.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            });
    }

    /**
     * Scope to get banners for a specific audience.
     */
    public function scopeForAudience($query, string $audience)
    {
        return $query->where(function ($q) use ($audience) {
            $q->where('target_audience', $audience)
                ->orWhere('target_audience', 'all');
        });
    }

    /**
     * Scope to get banners that should show on login.
     */
    public function scopeShowOnLogin($query)
    {
        return $query->where('show_on_login', true);
    }

    /**
     * Scope to get banners that should show on dashboard.
     */
    public function scopeShowOnDashboard($query)
    {
        return $query->where('show_on_dashboard', true);
    }

    /**
     * Scope to get banners not yet seen by a specific user.
     */
    public function scopeNotSeenBy($query, User $user)
    {
        return $query->whereDoesntHave('users', function ($q) use ($user) {
            $q->where('user_id', $user->id)->where('viewed', true);
        });
    }

    /**
     * Scope to get banners not dismissed by a specific user.
     */
    public function scopeNotDismissedBy($query, User $user)
    {
        return $query->whereDoesntHave('users', function ($q) use ($user) {
            $q->where('user_id', $user->id)->where('dismissed', true);
        });
    }

    /**
     * Check if banner is currently active.
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->start_date > $now) {
            return false;
        }

        if ($this->end_date && $this->end_date < $now) {
            return false;
        }

        return true;
    }

    /**
     * Mark banner as viewed by a user.
     */
    public function markAsViewedBy(User $user): void
    {
        $this->users()->syncWithoutDetaching([
            $user->id => [
                'viewed' => true,
                'viewed_at' => now(),
            ]
        ]);

        $this->increment('view_count');
    }

    /**
     * Mark banner as dismissed by a user.
     */
    public function markAsDismissedBy(User $user): void
    {
        $this->users()->syncWithoutDetaching([
            $user->id => [
                'dismissed' => true,
                'dismissed_at' => now(),
            ]
        ]);

        $this->increment('dismiss_count');
    }

    /**
     * Mark banner as clicked by a user.
     */
    public function markAsClickedBy(User $user): void
    {
        $this->users()->syncWithoutDetaching([
            $user->id => [
                'clicked' => true,
                'clicked_at' => now(),
            ]
        ]);

        $this->increment('click_count');
    }

    /**
     * Get banners for a specific user based on their role/context.
     */
    public static function getForUser(User $user, string $context = 'dashboard'): \Illuminate\Database\Eloquent\Collection
    {
        // Determine user's audience type
        $audience = ($user->member || $user->hasRole('teacher')) ? 'members' : 'all';

        $query = static::active()->forAudience($audience);

        if ($context === 'login') {
            $query->showOnLogin();
        } elseif ($context === 'dashboard') {
            $query->showOnDashboard();
        }

        return $query->notDismissedBy($user)->orderBy('start_date', 'desc')->get();
    }
}
