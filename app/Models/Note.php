<?php

namespace App\Models;

use App\Enums\MemberCareAlert;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    /** @use HasFactory<\Database\Factories\NoteFactory> */
    use HasFactory;

    protected $table = 'notes';

    protected $fillable = [
        'item_scope',
        'name',
        'deadline_date',
        'completed_date',
        'seen_date',
        'note_text',
        'added_by',
        'label',
        'visibility',
        'priority',
        'member_care_alert',
        'member_id',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'member_care_alert' => MemberCareAlert::class,
        ];
    }

    /**
     * Get the member that this note belongs to.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Get the user that this note is assigned to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
