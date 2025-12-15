<?php

namespace App\Models;

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
        'member_id',
        'user_id'
    ];

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
