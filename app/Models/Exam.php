<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
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

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }
}
