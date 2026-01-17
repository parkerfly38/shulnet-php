<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Yahrzeit extends Model
{
    use HasFactory;

    protected $table = 'yahrzeit';

    protected $fillable = [
        'name',
        'hebrew_name',
        'date_of_death',
        'hebrew_day_of_death',
        'hebrew_month_of_death',
        'hebrew_year_of_death',
        'observance_type',
        'notes',
    ];

    protected $casts = [
        'date_of_death' => 'date',
    ];

    /**
     * Get the members associated with this yahrzeit.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'member_yahrzeit')
            ->withPivot('relationship')
            ->withTimestamps();
    }
}
