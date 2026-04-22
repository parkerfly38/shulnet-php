<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(ParentModel::class, 'parent_student', 'student_id', 'parent_id');
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

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'student_id');
    }
}
