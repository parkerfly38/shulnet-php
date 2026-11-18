<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    protected $fillable = [
        'name',
        'subject_code',
        'description',
        'books',
        'class_id',
        'teacher_id',
    ];

    protected $appends = ['class_name', 'teacher_name'];

    public function classDefinition(): BelongsTo
    {
        return $this->belongsTo(ClassDefinition::class, 'class_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Names for the list and show pages. Filled only when classDefinition / teacher are loaded,
     * so serializing subjects elsewhere (e.g. exams with their subject) doesn't query per subject.
     */
    public function getClassNameAttribute(): ?string
    {
        return $this->relationLoaded('classDefinition') ? $this->classDefinition?->name : null;
    }

    public function getTeacherNameAttribute(): ?string
    {
        if (! $this->relationLoaded('teacher') || ! $this->teacher) {
            return null;
        }

        return trim("{$this->teacher->first_name} {$this->teacher->last_name}");
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class, 'subject_id');
    }

    public function classGrades(): HasMany
    {
        return $this->hasMany(ClassGrade::class, 'subject_id');
    }
}
