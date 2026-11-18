<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Attendance extends Model
{
    protected $fillable = [
        'student_id',
        'class_definition_id',
        'attendance_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'attendance_date' => 'date',
    ];

    /**
     * Store the date as Y-m-d, the way attendance is looked up, rather than the cast's "Y-m-d 00:00:00",
     * which SQLite keeps as text and which never matched a lookup by date.
     */
    protected function attendanceDate(): Attribute
    {
        return Attribute::make(set: fn ($value) => Carbon::parse($value)->toDateString());
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function classDefinition(): BelongsTo
    {
        return $this->belongsTo(ClassDefinition::class);
    }
}
