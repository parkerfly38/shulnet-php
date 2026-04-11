<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventTicketType;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventTicketTypeFactory extends Factory
{
    protected $model = EventTicketType::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->optional()->sentence(),
            'category' => $this->faker->randomElement(['early_bird', 'adult', 'child', 'member', 'nonmember', 'general', 'vip']),
            'price' => $this->faker->randomFloat(2, 0, 200),
            'quantity_available' => $this->faker->optional()->numberBetween(10, 100),
            'quantity_sold' => 0,
            'sale_starts' => null,
            'sale_ends' => null,
            'active' => true,
            'sort_order' => 0,
        ];
    }

    public function free(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'price' => 0,
            ];
        });
    }

    public function limited(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'quantity_available' => $this->faker->numberBetween(10, 50),
            ];
        });
    }

    public function soldOut(): static
    {
        return $this->state(function (array $attributes) {
            $quantity = $this->faker->numberBetween(10, 50);
            return [
                'quantity_available' => $quantity,
                'quantity_sold' => $quantity,
            ];
        });
    }

    public function inactive(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'active' => false,
            ];
        });
    }
}
