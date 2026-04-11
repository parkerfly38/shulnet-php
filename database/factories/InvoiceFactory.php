<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'member_id' => Member::factory(),
            'invoice_number' => 'INV-' . str_pad($this->faker->unique()->numberBetween(1, 999999), 6, '0', STR_PAD_LEFT),
            'invoice_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'due_date' => $this->faker->dateTimeBetween('now', '+2 months'),
            'status' => $this->faker->randomElement(['open', 'paid', 'partial', 'overdue', 'cancelled']),
            'subtotal' => $this->faker->randomFloat(2, 10, 1000),
            'tax_amount' => $this->faker->randomFloat(2, 0, 100),
            'total' => function (array $attributes) {
                return $attributes['subtotal'] + $attributes['tax_amount'];
            },
            'amount_paid' => $this->faker->randomFloat(2, 0, 500),
            'notes' => $this->faker->optional()->sentence(),
            'recurring' => false,
        ];
    }

    public function paid(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'paid',
                'amount_paid' => $attributes['total'],
            ];
        });
    }

    public function unpaid(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'open',
                'amount_paid' => 0,
            ];
        });
    }

    public function overdue(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'overdue',
                'due_date' => $this->faker->dateTimeBetween('-2 months', '-1 day'),
                'amount_paid' => 0,
            ];
        });
    }

    public function recurring(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'recurring' => true,
                'recurring_interval' => 'month',
                'recurring_interval_count' => 1,
                'next_invoice_date' => now()->addMonth(),
            ];
        });
    }
}
