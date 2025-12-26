<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\ParentModel;
use App\Models\ClassGrade;

class Student extends Model
{
    protected $fillable = [
        'last_name',
        'first_name',
        'middle_name',
        'gender',
        'date_of_birth',
        'dob',
        'address',
        'picture_url',
        'email',
        'is_parent_email',
        'parent_id',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ParentModel::class, 'parent_id');
    }

    public function classGrades(): HasMany
    {
        return $this->hasMany(ClassGrade::class, 'student_id');
    }

    public function examGrades(): HasMany
    {
        return $this->hasMany(ExamGrade::class, 'student_id');
    }

    public function subjectGrades(): HasMany
    {
        return $this->hasMany(SubjectGrade::class, 'student_id');
    }
}