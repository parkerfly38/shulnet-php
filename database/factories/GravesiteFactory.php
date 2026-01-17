<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Gravesite>
 */
class GravesiteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['available', 'reserved', 'occupied']);
        $gravesiteType = fake()->randomElement(['single', 'double', 'family', 'cremation']);

        return [
            'cemetery_name' => fake()->randomElement(['Beth Israel Cemetery', 'Mount Zion Cemetery', 'Garden of Peace', null]),
            'section' => fake()->randomElement(['A', 'B', 'C', 'D', 'E', null]),
            'row' => fake()->optional()->numberBetween(1, 20),
            'plot_number' => fake()->unique()->numberBetween(1, 500),
            'block' => fake()->optional()->randomElement(['North', 'South', 'East', 'West']),
            'status' => $status,
            'gravesite_type' => $gravesiteType,
            'size_length' => $gravesiteType === 'cremation' ? 4.0 : fake()->randomFloat(1, 8.0, 12.0),
            'size_width' => $gravesiteType === 'cremation' ? 4.0 : fake()->randomFloat(1, 3.0, 5.0),
            'member_id' => $status !== 'available' ? Member::factory() : null,
            'purchase_date' => $status !== 'available' ? fake()->dateTimeBetween('-20 years', '-1 year') : null,
            'purchase_price' => $status !== 'available' ? fake()->randomFloat(2, 2000, 15000) : null,
            'reserved_date' => $status === 'reserved' ? fake()->dateTimeBetween('-2 years', 'now') : null,
            'reserved_by' => $status === 'reserved' ? fake()->name() : null,
            'deceased_name' => $status === 'occupied' ? fake()->name() : null,
            'deceased_hebrew_name' => $status === 'occupied' ? fake()->optional()->firstName().' bat/ben '.fake()->firstName() : null,
            'date_of_birth' => $status === 'occupied' ? fake()->dateTimeBetween('-100 years', '-50 years') : null,
            'date_of_death' => $status === 'occupied' ? fake()->dateTimeBetween('-20 years', 'now') : null,
            'burial_date' => $status === 'occupied' ? fake()->dateTimeBetween('-20 years', 'now') : null,
            'notes' => fake()->optional()->sentence(),
            'gps_coordinates' => fake()->optional()->latitude().','.fake()->longitude(),
            'perpetual_care' => fake()->boolean(70),
            'monument_inscription' => $status === 'occupied' ? fake()->optional()->sentence() : null,
        ];
    }

    /**
     * Indicate that the gravesite is available.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
            'member_id' => null,
            'purchase_date' => null,
            'purchase_price' => null,
            'reserved_date' => null,
            'reserved_by' => null,
            'deceased_name' => null,
            'deceased_hebrew_name' => null,
            'date_of_birth' => null,
            'date_of_death' => null,
            'burial_date' => null,
            'monument_inscription' => null,
        ]);
    }

    /**
     * Indicate that the gravesite is reserved.
     */
    public function reserved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'reserved',
            'member_id' => Member::factory(),
            'purchase_date' => fake()->dateTimeBetween('-5 years', '-1 year'),
            'purchase_price' => fake()->randomFloat(2, 2000, 15000),
            'reserved_date' => fake()->dateTimeBetween('-2 years', 'now'),
            'reserved_by' => fake()->name(),
            'deceased_name' => null,
            'deceased_hebrew_name' => null,
            'date_of_birth' => null,
            'date_of_death' => null,
            'burial_date' => null,
            'monument_inscription' => null,
        ]);
    }

    /**
     * Indicate that the gravesite is occupied.
     */
    public function occupied(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'occupied',
            'member_id' => Member::factory(),
            'purchase_date' => fake()->dateTimeBetween('-20 years', '-1 year'),
            'purchase_price' => fake()->randomFloat(2, 2000, 15000),
            'deceased_name' => fake()->name(),
            'deceased_hebrew_name' => fake()->firstName().' bat/ben '.fake()->firstName(),
            'date_of_birth' => fake()->dateTimeBetween('-100 years', '-50 years'),
            'date_of_death' => fake()->dateTimeBetween('-20 years', 'now'),
            'burial_date' => fake()->dateTimeBetween('-20 years', 'now'),
            'monument_inscription' => fake()->sentence(),
        ]);
    }
}
