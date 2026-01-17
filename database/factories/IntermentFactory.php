<?php

namespace Database\Factories;

use App\Models\Deed;
use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Interment>
 */
class IntermentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dateOfDeath = $this->faker->dateTimeBetween('-10 years', 'now');
        $dateOfBirth = $this->faker->dateTimeBetween('-100 years', $dateOfDeath);
        $intermentDate = $this->faker->dateTimeBetween($dateOfDeath, '+7 days');

        return [
            'deed_id' => Deed::factory(),
            'member_id' => $this->faker->optional(0.7)->passthrough(Member::factory()),
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'middle_name' => $this->faker->optional(0.3)->firstName,
            'hebrew_name' => $this->faker->optional(0.6)->name,
            'date_of_birth' => $dateOfBirth,
            'date_of_death' => $dateOfDeath,
            'interment_date' => $intermentDate,
            'cause_of_death' => $this->faker->optional(0.4)->randomElement([
                'Natural causes',
                'Illness',
                'Heart failure',
                'Cancer',
                'Age-related',
            ]),
            'funeral_home' => $this->faker->optional(0.7)->company.' Funeral Home',
            'rabbi_officiating' => $this->faker->optional(0.8)->name,
            'notes' => $this->faker->optional(0.2)->sentence,
        ];
    }
}
