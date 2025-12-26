<?php

namespace Database\Factories;

use App\Models\SubjectGrade;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubjectGradeFactory extends Factory
{
    protected $model = SubjectGrade::class;

    public function definition()
    {
        return [
            'subject_id' => null,
            'student_id' => null,
            'grade' => $this->faker->optional()->randomElement(['A', 'B', 'C', 'D', 'F']),
        ];
    }
}
