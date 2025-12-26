<?php

namespace Database\Factories;

use App\Models\Exam;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExamFactory extends Factory
{
    protected $model = Exam::class;

    public function definition()
    {
        return [
            'name' => $this->faker->sentence(2),
            'date' => $this->faker->optional()->date(),
            'description' => $this->faker->optional()->paragraph(),
        ];
    }
}
