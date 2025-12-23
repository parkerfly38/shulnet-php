<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MembershipPeriod>
 */
class MembershipPeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $beginDate = fake()->dateTimeBetween('-5 years', 'now');
        $hasEndDate = fake()->boolean(30); // 30% chance of having an end date
        
        return [
            'member_id' => Member::factory(),
            'invoice_id' => null, // Optional - can be set when creating
            'begin_date' => $beginDate,
            'end_date' => $hasEndDate ? fake()->dateTimeBetween($beginDate, 'now') : null,
            'membership_type' => fake()->randomElement(['annual', 'lifetime', 'student', 'family', 'honorary']),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the membership period is active (no end date).
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'end_date' => null,
        ]);
    }

    /**
     * Indicate that the membership period is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'end_date' => fake()->dateTimeBetween('-2 years', '-1 day'),
        ]);
    }
}
