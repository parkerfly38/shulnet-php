<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

class EmailSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Get a setting value by key
     */
    public static function get(string $key, $default = null)
    {
        return Cache::remember("email_setting_{$key}", 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Set a setting value by key
     */
    public static function set(string $key, $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
        Cache::forget("email_setting_{$key}");
    }

    /**
     * Get all settings as array
     */
    public static function getAll(): array
    {
        return Cache::remember('email_settings_all', 3600, function () {
            return self::pluck('value', 'key')->toArray();
        });
    }

    /**
     * Clear settings cache
     */
    public static function clearCache(): void
    {
        Cache::flush();
    }

    /**
     * Configure mailer with current settings
     */
    public static function configureMailer(): void
    {
        $provider = self::get('provider', 'smtp');

        $fromAddress = self::get('from_address');
        $fromName = self::get('from_name');
        
        if (!$fromAddress) {
            throw new \Exception('From email address is not configured');
        }

        Config::set('mail.from.address', $fromAddress);
        Config::set('mail.from.name', $fromName ?: 'Application');
        Config::set('mail.default', $provider);

        switch ($provider) {
            case 'smtp':
                $host = self::get('smtp_host');
                if (!$host) {
                    throw new \Exception('SMTP host is not configured');
                }
                
                Config::set('mail.mailers.smtp', [
                    'transport' => 'smtp',
                    'host' => $host,
                    'port' => self::get('smtp_port', 587),
                    'encryption' => self::get('smtp_encryption', 'tls'),
                    'username' => self::get('smtp_username'),
                    'password' => self::get('smtp_password'),
                ]);
                break;

            case 'mailgun':
                $domain = self::get('mailgun_domain');
                $secret = self::get('mailgun_secret');
                
                if (!$domain || !$secret) {
                    throw new \Exception('Mailgun domain and secret are required');
                }
                
                Config::set('services.mailgun', [
                    'domain' => $domain,
                    'secret' => $secret,
                    'endpoint' => self::get('mailgun_endpoint', 'api.mailgun.net'),
                ]);
                
                Config::set('mail.mailers.mailgun', [
                    'transport' => 'mailgun',
                ]);
                break;

            case 'sendgrid':
                $apiKey = self::get('sendgrid_api_key');
                
                if (!$apiKey) {
                    throw new \Exception('SendGrid API key is required');
                }
                
                Config::set('services.sendgrid', [
                    'api_key' => $apiKey,
                ]);
                Config::set('mail.mailers.sendgrid', [
                    'transport' => 'sendgrid',
                ]);
                break;

            case 'ses':
                $key = self::get('ses_key');
                $secret = self::get('ses_secret');
                
                if (!$key || !$secret) {
                    throw new \Exception('AWS SES key and secret are required');
                }
                
                Config::set('services.ses', [
                    'key' => $key,
                    'secret' => $secret,
                    'region' => self::get('ses_region', 'us-east-1'),
                ]);
                break;

            case 'log':
                // Log driver doesn't need additional configuration
                break;

            default:
                throw new \Exception('Invalid email provider: ' . $provider);
        }
    }
}
