<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubjectGrade extends Model
{
    protected $fillable = [
        'student_id',
        'subject_id',
        'letter_grade',
        'grade',
        'remarks'
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}