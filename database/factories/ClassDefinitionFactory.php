<?php

namespace Database\Factories;

use App\Models\ClassDefinition;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassDefinitionFactory extends Factory
{
    protected $model = ClassDefinition::class;

    public function definition()
    {
        return [
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
        ];
    }
}
