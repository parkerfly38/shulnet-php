<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'subject',
        'from',
        'to',
        'cc',
        'bcc',
        'date_sent',
        'conversation_id',
        'message_id',
    ];

    protected $casts = [
        'date_sent' => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
