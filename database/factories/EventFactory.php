<?php

namespace Database\Factories;

use App\Models\Calendar;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('now', '+3 months');
        // Create a proper DateTime object for end date calculation
        $startDateTime = new \DateTime($startDate->format('Y-m-d H:i:s'));
        $endDateTime = clone $startDateTime;
        $endDateTime->modify('+'.rand(1, 4).' hours');

        return [
            'name' => $this->faker->sentence(3),
            'tagline' => $this->faker->optional()->sentence(),
            'description' => $this->faker->optional()->paragraph(),
            'event_start' => $startDate,
            'event_end' => $endDateTime,
            'registration_required' => $this->faker->boolean(30),
            'registration_starts' => null,
            'registration_ends' => null,
            'earlybird' => false,
            'registration_closed' => false,
            'maxrsvp' => null,
            'members_only' => $this->faker->boolean(20),
            'allow_guests' => $this->faker->boolean(50),
            'max_guests' => $this->faker->optional()->numberBetween(1, 5),
            'rsvp_message' => null,
            'online' => $this->faker->boolean(30),
            'online_url' => null,
            'all_day' => false,
            'public' => $this->faker->boolean(70),
            'location' => $this->faker->optional()->address(),
            'calendar_id' => Calendar::factory(),
        ];
    }
}
