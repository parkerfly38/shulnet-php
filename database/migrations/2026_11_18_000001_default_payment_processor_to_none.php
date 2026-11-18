<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Online payments now default to off ("none") instead of Stripe. Installs still on the old Stripe
 * default without any Stripe keys were never able to take payments, so they move to none; anyone
 * with keys in Settings or .env, or on another processor, keeps their choice.
 */
return new class extends Migration
{
    public function up(): void
    {
        $settings = DB::table('settings')
            ->whereIn('key', ['payment_processor', 'stripe_public_key', 'stripe_secret_key'])
            ->pluck('value', 'key');

        $hasStripeKeys = trim((string) (($settings['stripe_secret_key'] ?? '') ?: config('services.stripe.secret_key'))) !== '';
        $processor = $settings['payment_processor'] ?? null;

        if ($processor === null) {
            DB::table('settings')->insert([
                'key' => 'payment_processor', 'value' => 'none', 'type' => 'select',
                'created_at' => now(), 'updated_at' => now(),
            ]);
        } elseif (in_array($processor, ['', 'stripe'], true) && ! $hasStripeKeys) {
            DB::table('settings')->where('key', 'payment_processor')->update(['value' => 'none', 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'payment_processor')->where('value', 'none')
            ->update(['value' => 'stripe', 'updated_at' => now()]);
    }
};
