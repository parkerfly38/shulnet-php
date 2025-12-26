<?php

namespace Database\Factories;

use App\Models\ClassGrade;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassGradeFactory extends Factory
{
    protected $model = ClassGrade::class;

    public function definition()
    {
        return [
            'class_definition_id' => null,
            'student_id' => null,
            'grade' => $this->faker->randomElement(['A', 'B', 'C', 'D', 'F']),
        ];
    }
}
