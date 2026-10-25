<?php

namespace Tests\Unit\Services;

use App\Models\Setting;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsServiceTest extends TestCase
{
    use RefreshDatabase;

    private function service(): SettingsService
    {
        return app(SettingsService::class);
    }

    public function test_get_returns_default_until_set_and_set_overwrites(): void
    {
        $this->assertSame('fallback', $this->service()->get('missing', 'fallback'));

        $this->service()->set('some_key', 'one');
        $this->assertSame('one', $this->service()->get('some_key'));

        $this->service()->set('some_key', 'two');
        $this->assertSame('two', $this->service()->get('some_key'));
        $this->assertSame(1, Setting::where('key', 'some_key')->count());
    }

    public function test_calendar_helpers_have_sensible_defaults_and_follow_settings(): void
    {
        $this->assertFalse($this->service()->isIsrael());
        $this->assertFalse($this->service()->isTriennialCycle());
        $this->assertSame(18, $this->service()->getCandleLightingOffset());
        $this->assertSame(42, $this->service()->getHavdalahOffset());
        $this->assertSame('USD', $this->service()->getCurrency());

        $this->service()->set('jewish_calendar_location', 'israel');
        $this->service()->set('torah_reading_cycle', 'triennial');
        $this->service()->set('shabbat_candle_lighting_offset', '40');
        $this->service()->set('havdalah_offset', '50');
        $this->service()->set('currency', 'ILS');

        $this->assertTrue($this->service()->isIsrael());
        $this->assertTrue($this->service()->isTriennialCycle());
        $this->assertSame(40, $this->service()->getCandleLightingOffset());
        $this->assertSame(50, $this->service()->getHavdalahOffset());
        $this->assertSame('ILS', $this->service()->getCurrency());
    }

    public function test_config_bundles_use_defaults_and_overrides(): void
    {
        $this->assertSame('smtp.mailtrap.io', $this->service()->getSmtpConfig()['host']);
        $this->assertSame('#1e40af', $this->service()->getEmailTemplateConfig()['header_color']);
        $this->assertSame('', $this->service()->getPdfTemplateConfig()['footer_text']);

        $this->service()->set('smtp_host', 'mail.example.org');
        $this->service()->set('email_header_color', '#000000');
        $this->service()->set('pdf_footer_text', 'Footer');

        $this->assertSame('mail.example.org', $this->service()->getSmtpConfig()['host']);
        $this->assertSame('#000000', $this->service()->getEmailTemplateConfig()['header_color']);
        $this->assertSame('Footer', $this->service()->getPdfTemplateConfig()['footer_text']);
        $this->assertSame(
            ['host', 'port', 'username', 'password', 'encryption', 'from_address', 'from_name'],
            array_keys($this->service()->getSmtpConfig())
        );
    }
}
