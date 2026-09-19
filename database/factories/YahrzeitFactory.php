<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Yahrzeit>
 */
class YahrzeitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'hebrew_name' => $this->faker->optional()->firstName(),
            'date_of_death' => $this->faker->dateTimeBetween('-50 years', '-1 year'),
            'hebrew_day_of_death' => $this->faker->optional()->numberBetween(1, 29),
            'hebrew_month_of_death' => $this->faker->optional()->randomElement(['Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Adar II', 'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul']),
            'hebrew_year_of_death' => $this->faker->optional()->numberBetween(5700, 5785),
            'observance_type' => $this->faker->randomElement(['none', 'candle', 'kaddish', 'both']),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
