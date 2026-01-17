<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassDefinition extends Model
{
    protected $fillable = [
        'name',
        'class_number',
        'capacity',
        'teacher_id',
        'start_date',
        'end_date',
        'location',
        'fee',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class, 'class_id');
    }

    public function classGrades(): HasMany
    {
        return $this->hasMany(ClassGrade::class, 'class_id');
    }
}
