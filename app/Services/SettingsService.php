<?php

namespace App\Services;

use App\Models\Setting;

class SettingsService
{
    /**
     * Get a setting value with optional default.
     */
    public function get(string $key, $default = null)
    {
        return Setting::get($key, $default);
    }

    /**
     * Set a setting value.
     */
    public function set(string $key, $value): void
    {
        Setting::set($key, $value);
    }

    /**
     * Check if using Israel calendar settings.
     */
    public function isIsrael(): bool
    {
        return $this->get('jewish_calendar_location', 'diaspora') === 'israel';
    }

    /**
     * Check if using triennial Torah reading cycle.
     */
    public function isTriennialCycle(): bool
    {
        return $this->get('torah_reading_cycle', 'annual') === 'triennial';
    }

    /**
     * Get candle lighting offset in minutes.
     */
    public function getCandleLightingOffset(): int
    {
        return (int) $this->get('shabbat_candle_lighting_offset', 18);
    }

    /**
     * Get Havdalah offset in minutes.
     */
    public function getHavdalahOffset(): int
    {
        return (int) $this->get('havdalah_offset', 42);
    }

    /**
     * Get currency code.
     */
    public function getCurrency(): string
    {
        return $this->get('currency', 'USD');
    }

    /**
     * Get SMTP configuration as array.
     */
    public function getSmtpConfig(): array
    {
        return [
            'host' => $this->get('smtp_host', 'smtp.mailtrap.io'),
            'port' => $this->get('smtp_port', '2525'),
            'username' => $this->get('smtp_username', ''),
            'password' => $this->get('smtp_password', ''),
            'encryption' => $this->get('smtp_encryption', 'tls'),
            'from_address' => $this->get('mail_from_address', 'noreply@example.com'),
            'from_name' => $this->get('mail_from_name', 'Shulnet Portal'),
        ];
    }

    /**
     * Get email template configuration.
     */
    public function getEmailTemplateConfig(): array
    {
        return [
            'header_color' => $this->get('email_header_color', '#1e40af'),
            'footer_text' => $this->get('email_footer_text', 'Thank you for being part of our community.'),
        ];
    }

    /**
     * Get PDF template configuration.
     */
    public function getPdfTemplateConfig(): array
    {
        return [
            'header_logo_url' => $this->get('pdf_header_logo_url', ''),
            'footer_text' => $this->get('pdf_footer_text', ''),
        ];
    }
}
