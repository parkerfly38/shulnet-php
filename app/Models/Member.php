<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    /** @use HasFactory<\Database\Factories\MemberFactory> */
    use HasFactory;

    protected $fillable = [
        'member_type',
        'lastrenewal',
        'lastaction',
        'lastlogin',
        'email',
        'phone1',
        'phone2',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'zip',
        'country',
        'dob',
        'first_name',
        'last_name',
        'middle_name',
        'title',
        'gender',
        'aliyah',
        'bnaimitzvahdate',
        'chazanut',
        'tribe',
        'dvartorah',
        'deceased',
        'father_hebrew_name',
        'mother_hebrew_name',
        'hebrew_name',
        'briabatorah',
        'maftir',
        'anniversary_date',
        'parent_id',
        'user_id'
    ];

    /**
     * Get the yahrzeits associated with this member.
     */
    public function yahrzeits(): BelongsToMany
    {
        return $this->belongsToMany(Yahrzeit::class, 'member_yahrzeit')
                    ->withPivot('relationship')
                    ->withTimestamps();
    }

    /**
     * Get all membership periods for this member.
     */
    public function membershipPeriods(): HasMany
    {
        return $this->hasMany(MembershipPeriod::class);
    }

    /**
     * Get active membership periods.
     */
    public function activeMembershipPeriods(): HasMany
    {
        return $this->hasMany(MembershipPeriod::class)
                    ->where(function ($query) {
                        $query->whereNull('end_date')
                              ->orWhere('end_date', '>=', now());
                    });
    }

    /**
     * Check if member has an active membership.
     */
    public function hasActiveMembership(): bool
    {
        return $this->membershipPeriods()
                    ->where(function ($query) {
                        $query->whereNull('end_date')
                              ->orWhere('end_date', '>=', now());
                    })
                    ->exists();
    }

    /**
     * Get the parent record associated with this member.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ParentModel::class, 'parent_id');
    }

    /**
     * Get the user associated with this member.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get all email campaigns this member is subscribed to.
     */
    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(EmailCampaign::class, 'campaign_subscriptions')
            ->withPivot('status', 'confirmation_token', 'confirmed_at', 'unsubscribed_at')
            ->withTimestamps();
    }
}