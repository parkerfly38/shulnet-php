<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GabbaiAssignment extends Model
{
    protected $fillable = [
        'member_id',
        'date',
        'honor',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
