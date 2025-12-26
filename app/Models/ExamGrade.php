<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamGrade extends Model
{
    protected $fillable = [
        'exam_id',
        'student_id',
        'letter_grade',
        'grade',
        'score',
        'remarks'
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

}