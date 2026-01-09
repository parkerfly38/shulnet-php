<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Deed>
 */
class DeedFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'member_id' => Member::factory(),
            'deed_number' => 'DEED-' . $this->faker->unique()->numerify('####'),
            'purchase_date' => $this->faker->dateTimeBetween('-30 years', 'now'),
            'purchase_price' => $this->faker->randomFloat(2, 1000, 15000),
            'occupied' => 0,
            'notes' => $this->faker->optional(0.3)->sentence,
            'is_active' => $this->faker->boolean(95),
        ];
    }

    /**
     * Indicate that the deed is fully occupied.
     */
    public function occupied(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'occupied' => $this->faker->numberBetween(1, 3),
            ];
        });
    }

    /**
     * Indicate that the deed is partially occupied.
     */
    public function partiallyOccupied(): static
    {
        return $this->state(function (array $attributes) {
            $capacity = $attributes['capacity'];
            return [
                'occupied' => $this->faker->numberBetween(1, max(1, $capacity - 1)),
            ];
        });
    }
}
