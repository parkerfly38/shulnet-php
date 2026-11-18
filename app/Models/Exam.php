<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    protected $fillable = [
        'name',
        'subject_id',
        'start_date',
        'end_date',
    ];

    public function examgrades(): HasMany
    {
        return $this->hasMany(ExamGrade::class, 'exam_id');
    }

    protected $appends = ['subject_name'];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * For the exam list and show pages. Filled only when subject is loaded, so it never queries per exam.
     */
    public function getSubjectNameAttribute(): ?string
    {
        return $this->relationLoaded('subject') ? $this->subject?->name : null;
    }
}
