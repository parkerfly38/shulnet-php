<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventTicketType;
use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventRSVP>
 */
class EventRSVPFactory extends Factory
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
            'event_id' => Event::factory(),
            'event_ticket_type_id' => null,
            'invoice_id' => null,
            'name' => $this->faker->name(),
            'email' => $this->faker->email(),
            'phone' => $this->faker->phoneNumber(),
            'guests' => $this->faker->numberBetween(0, 3),
            'quantity' => 1,
            'ticket_price' => 0,
            'total_amount' => 0,
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'cancelled']),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
