<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassGrade extends Model
{
    protected $fillable = [
        'class_definition_id',
        'class_id',
        'student_id',
        'letter_grade',
        'grade',
        'remarks',
    ];

    public function classDefinition()
    {
        return $this->belongsTo(ClassDefinition::class, 'class_definition_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
