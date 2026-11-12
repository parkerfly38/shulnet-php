<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * The site_name setting becomes the synagogue name shown on letters, invoices, emails and printouts.
 * Installs still on the seeded placeholder get APP_NAME, so documents read the same as before the upgrade.
 */
return new class extends Migration
{
    private const DESCRIPTION = 'Synagogue name (shown on letters, invoices, emails and printouts)';

    public function up(): void
    {
        $row = DB::table('settings')->where('key', 'site_name')->first();
        $current = trim((string) ($row->value ?? ''));
        $value = ($current === '' || $current === 'Shulnet Portal') ? config('app.name') : $current;

        if ($row) {
            DB::table('settings')->where('key', 'site_name')->update([
                'value' => $value,
                'description' => self::DESCRIPTION,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('settings')->insert([
                'key' => 'site_name',
                'value' => $value,
                'group' => 'general',
                'type' => 'text',
                'description' => self::DESCRIPTION,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Cache::forget('setting_site_name');
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'site_name')->update([
            'description' => 'Name of the synagogue or organization',
        ]);
    }
};
