<?php

namespace Database\Factories;

use App\Models\ParentModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class ParentModelFactory extends Factory
{
    protected $model = ParentModel::class;

    public function definition()
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->optional()->safeEmail(),
            'phone' => $this->faker->optional()->phoneNumber(),
        ];
    }
}
