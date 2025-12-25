<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Settings
            [
                'key' => 'site_name',
                'value' => 'Shulnet Portal',
                'group' => 'general',
                'type' => 'text',
                'description' => 'Name of the synagogue or organization',
            ],
            [
                'key' => 'site_timezone',
                'value' => 'America/New_York',
                'group' => 'general',
                'type' => 'select',
                'description' => 'Timezone for the portal',
            ],
            
            // Jewish Calendar Settings
            [
                'key' => 'jewish_calendar_location',
                'value' => 'diaspora',
                'group' => 'jewish_calendar',
                'type' => 'select',
                'description' => 'Diaspora or Israel - affects holiday observances',
            ],
            [
                'key' => 'torah_reading_cycle',
                'value' => 'annual',
                'group' => 'jewish_calendar',
                'type' => 'select',
                'description' => 'Annual (Full Torah) or Triennial cycle for Torah readings',
            ],
            [
                'key' => 'shabbat_candle_lighting_offset',
                'value' => '18',
                'group' => 'jewish_calendar',
                'type' => 'text',
                'description' => 'Minutes before sunset for candle lighting',
            ],
            [
                'key' => 'havdalah_offset',
                'value' => '42',
                'group' => 'jewish_calendar',
                'type' => 'text',
                'description' => 'Minutes after sunset for Havdalah',
            ],
            
            // Email Settings
            [
                'key' => 'mail_from_address',
                'value' => 'noreply@example.com',
                'group' => 'email',
                'type' => 'email',
                'description' => 'From email address',
            ],
            [
                'key' => 'mail_from_name',
                'value' => 'Shulnet Portal',
                'group' => 'email',
                'type' => 'text',
                'description' => 'From name for emails',
            ],
            [
                'key' => 'smtp_host',
                'value' => 'smtp.mailtrap.io',
                'group' => 'email',
                'type' => 'text',
                'description' => 'SMTP server host',
            ],
            [
                'key' => 'smtp_port',
                'value' => '2525',
                'group' => 'email',
                'type' => 'text',
                'description' => 'SMTP server port',
            ],
            [
                'key' => 'smtp_username',
                'value' => '',
                'group' => 'email',
                'type' => 'text',
                'description' => 'SMTP username',
            ],
            [
                'key' => 'smtp_password',
                'value' => '',
                'group' => 'email',
                'type' => 'password',
                'description' => 'SMTP password',
            ],
            [
                'key' => 'smtp_encryption',
                'value' => 'tls',
                'group' => 'email',
                'type' => 'select',
                'description' => 'SMTP encryption (tls/ssl)',
            ],
            
            // Template Settings
            [
                'key' => 'email_header_color',
                'value' => '#1e40af',
                'group' => 'templates',
                'type' => 'color',
                'description' => 'Primary color for email templates',
            ],
            [
                'key' => 'email_footer_text',
                'value' => 'Thank you for being part of our community.',
                'group' => 'templates',
                'type' => 'textarea',
                'description' => 'Default footer text for emails',
            ],
            [
                'key' => 'pdf_header_logo_url',
                'value' => '',
                'group' => 'templates',
                'type' => 'text',
                'description' => 'URL to logo for PDF templates',
            ],
            [
                'key' => 'pdf_footer_text',
                'value' => '',
                'group' => 'templates',
                'type' => 'textarea',
                'description' => 'Default footer text for PDF documents',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Settings seeded successfully!');
    }
}
