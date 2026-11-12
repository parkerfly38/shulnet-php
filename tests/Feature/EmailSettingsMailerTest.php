<?php

namespace Tests\Feature;

use App\Models\EmailSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Tests\TestCase;

class EmailSettingsMailerTest extends TestCase
{
    use RefreshDatabase;

    private function freshMailer(): \Illuminate\Mail\Mailer
    {
        $this->app->forgetInstance('mail.manager');
        $this->app->forgetInstance('mailer');
        Mail::clearResolvedInstances();

        return Mail::mailer();
    }

    // Password resets, reminders and invoices used .env while only campaigns used Email Settings.
    public function test_all_mail_uses_the_provider_from_email_settings(): void
    {
        foreach ([
            'provider' => 'smtp', 'from_address' => 'office@shul.example', 'from_name' => 'Temple Office',
            'smtp_host' => 'smtp.shul.example', 'smtp_port' => '587', 'smtp_encryption' => 'tls',
        ] as $key => $value) {
            EmailSetting::set($key, $value);
        }

        $transport = $this->freshMailer()->getSymfonyTransport();

        $this->assertInstanceOf(EsmtpTransport::class, $transport);
        $this->assertSame('smtp.shul.example', $transport->getStream()->getHost());
        $this->assertSame('office@shul.example', config('mail.from.address'));
        $this->assertSame('Temple Office', config('mail.from.name'));
    }

    public function test_env_mail_config_is_kept_when_email_settings_are_missing_or_incomplete(): void
    {
        $this->freshMailer();
        $this->assertSame('array', config('mail.default'));

        EmailSetting::set('provider', 'smtp');
        EmailSetting::set('from_address', 'office@shul.example'); // no SMTP host yet

        $this->freshMailer();
        $this->assertSame('array', config('mail.default'));
        $this->assertNotSame('office@shul.example', config('mail.from.address'));
    }
}
