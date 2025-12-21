<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Member>
 */
class MemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'middle_name' => $this->faker->optional(0.3)->firstName,
            'title' => $this->faker->optional(0.2)->randomElement(['Mr.', 'Mrs.', 'Dr.', 'Rabbi']),
            'email' => $this->faker->unique()->safeEmail,
            'phone1' => $this->faker->optional(0.8)->phoneNumber,
            'phone2' => $this->faker->optional(0.2)->phoneNumber,
            'address_line_1' => $this->faker->optional(0.7)->streetAddress,
            'address_line_2' => $this->faker->optional(0.1)->secondaryAddress,
            'city' => $this->faker->optional(0.7)->city,
            'state' => $this->faker->optional(0.7)->stateAbbr,
            'zip' => $this->faker->optional(0.7)->postcode,
            'country' => $this->faker->optional(0.5)->country,
            'dob' => $this->faker->optional(0.6)->passthrough($this->faker->dateTimeBetween('-80 years', '-18 years'))?->format('Y-m-d'),
            'gender' => $this->faker->optional(0.7)->randomElement(['male', 'female', 'other']),
        ];
    }
}
