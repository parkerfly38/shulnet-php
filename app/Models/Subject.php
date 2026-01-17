<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    protected $fillable = [
        'name',
        'subject_code',
        'books',
        'class_id',
        'teacher_id',
    ];

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class, 'subject_id');
    }

    public function classGrades(): HasMany
    {
        return $this->hasMany(ClassGrade::class, 'subject_id');
    }
}
