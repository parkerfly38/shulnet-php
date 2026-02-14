<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert Zoom settings
        DB::table('settings')->insert([
            [
                'key' => 'zoom_enabled',
                'value' => 'false',
                'group' => 'integrations',
                'type' => 'boolean',
                'description' => 'Enable Zoom integration for online events and meetings',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'zoom_account_id',
                'value' => '',
                'group' => 'integrations',
                'type' => 'text',
                'description' => 'Zoom Account ID for Server-to-Server OAuth',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'zoom_client_id',
                'value' => '',
                'group' => 'integrations',
                'type' => 'text',
                'description' => 'Zoom Client ID for Server-to-Server OAuth',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'zoom_client_secret',
                'value' => '',
                'group' => 'integrations',
                'type' => 'password',
                'description' => 'Zoom Client Secret for Server-to-Server OAuth',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'zoom_user_id',
                'value' => 'me',
                'group' => 'integrations',
                'type' => 'text',
                'description' => 'Zoom User ID (use "me" for account owner)',
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
            'zoom_enabled',
            'zoom_account_id',
            'zoom_client_id',
            'zoom_client_secret',
            'zoom_user_id',
        ])->delete();
    }
};
