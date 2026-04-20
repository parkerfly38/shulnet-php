<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberRelationship extends Model
{
    protected $fillable = [
        'member_id',
        'related_member_id',
        'relationship_type',
    ];

    /**
     * Common relationship types
     */
    public const RELATIONSHIP_TYPES = [
        'parent' => 'Parent',
        'child' => 'Child',
        'son' => 'Son',
        'daughter' => 'Daughter',
        'spouse' => 'Spouse',
        'sibling' => 'Sibling',
        'brother' => 'Brother',
        'sister' => 'Sister',
        'grandparent' => 'Grandparent',
        'grandchild' => 'Grandchild',
        'other' => 'Other',
    ];

    /**
     * Get the member who has this relationship
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    /**
     * Get the related member
     */
    public function relatedMember(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'related_member_id');
    }
}
