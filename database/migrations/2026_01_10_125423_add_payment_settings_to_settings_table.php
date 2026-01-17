<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert default payment settings
        DB::table('settings')->insert([
            [
                'key' => 'payment_processor',
                'value' => 'stripe',
                'type' => 'select',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'stripe_public_key',
                'value' => '',
                'type' => 'text',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'stripe_secret_key',
                'value' => '',
                'type' => 'password',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'authorize_net_api_login_id',
                'value' => '',
                'type' => 'text',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'authorize_net_transaction_key',
                'value' => '',
                'type' => 'password',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'authorize_net_environment',
                'value' => 'sandbox',
                'type' => 'select',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'paypal_client_id',
                'value' => '',
                'type' => 'text',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'paypal_secret',
                'value' => '',
                'type' => 'password',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'paypal_mode',
                'value' => 'sandbox',
                'type' => 'select',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'payment_processor',
            'stripe_public_key',
            'stripe_secret_key',
            'authorize_net_api_login_id',
            'authorize_net_transaction_key',
            'authorize_net_environment',
            'paypal_client_id',
            'paypal_secret',
            'paypal_mode',
        ])->delete();
    }
};
