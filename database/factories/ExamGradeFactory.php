<?php

namespace Database\Factories;

use App\Models\ExamGrade;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExamGradeFactory extends Factory
{
    protected $model = ExamGrade::class;

    public function definition()
    {
        return [
            'exam_id' => null,
            'student_id' => null,
            'score' => $this->faker->optional()->numberBetween(0, 100),
            'grade' => $this->faker->optional()->randomElement(['A', 'B', 'C', 'D', 'F']),
        ];
    }
}
