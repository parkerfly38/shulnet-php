<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'member_id' => Member::factory(),
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'payment_method' => $this->faker->randomElement(['stripe', 'authorize_net', 'paypal', 'credit_card', 'check', 'cash']),
            'transaction_id' => $this->faker->optional()->uuid(),
            'status' => $this->faker->randomElement(['pending', 'completed', 'failed', 'refunded']),
            'payment_details' => null,
            'paid_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }

    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
                'paid_at' => now(),
            ];
        });
    }

    public function pending(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'paid_at' => null,
            ];
        });
    }
}
