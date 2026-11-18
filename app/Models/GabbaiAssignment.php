<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class GabbaiAssignment extends Model
{
    use HasFactory;
    protected $fillable = [
        'member_id',
        'date',
        'honor',
        'portion',
        'reading',
        'notified_at',
        'reminded_at',
    ];

    protected $casts = [
        'date' => 'date',
        'notified_at' => 'datetime',
        'reminded_at' => 'datetime',
    ];

    /**
     * Store the date as Y-m-d, the way saved honors are looked up, rather than the cast's "Y-m-d 00:00:00".
     */
    protected function date(): Attribute
    {
        return Attribute::make(set: fn ($value) => Carbon::parse($value)->toDateString());
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
