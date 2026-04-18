<?php

namespace Tests\Unit\Services;

use App\Models\Setting;
use App\Services\AuthorizeNetPaymentGateway;
use App\Services\PaymentService;
use App\Services\PayPalPaymentGateway;
use App\Services\StripePaymentGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_defaults_to_stripe_gateway_when_no_setting_exists()
    {
        // Clear any existing settings
        Setting::where('key', 'payment_processor')->delete();
        
        $service = new PaymentService();
        $gateway = $service->getGateway();

        $this->assertInstanceOf(StripePaymentGateway::class, $gateway);
    }

    public function test_uses_stripe_gateway_when_configured()
    {
        Setting::where('key', 'payment_processor')->delete();
        Setting::create([
            'key' => 'payment_processor',
            'value' => 'stripe',
        ]);

        $service = new PaymentService();
        $gateway = $service->getGateway();

        $this->assertInstanceOf(StripePaymentGateway::class, $gateway);
    }

    public function test_uses_authorize_net_gateway_when_configured()
    {
        Setting::where('key', 'payment_processor')->delete();
        Setting::create([
            'key' => 'payment_processor',
            'value' => 'authorize_net',
        ]);

        $service = new PaymentService();
        $gateway = $service->getGateway();

        $this->assertInstanceOf(AuthorizeNetPaymentGateway::class, $gateway);
    }

    public function test_uses_paypal_gateway_when_configured()
    {
        Setting::where('key', 'payment_processor')->delete();
        Setting::create([
            'key' => 'payment_processor',
            'value' => 'paypal',
        ]);

        $service = new PaymentService();
        $gateway = $service->getGateway();

        $this->assertInstanceOf(PayPalPaymentGateway::class, $gateway);
    }

    public function test_defaults_to_stripe_for_unknown_processor()
    {
        Setting::where('key', 'payment_processor')->delete();
        Setting::create([
            'key' => 'payment_processor',
            'value' => 'unknown_processor',
        ]);

        $service = new PaymentService();
        $gateway = $service->getGateway();

        $this->assertInstanceOf(StripePaymentGateway::class, $gateway);
    }

    public function test_get_active_processor_returns_correct_value()
    {
        Setting::where('key', 'payment_processor')->delete();
        Setting::create([
            'key' => 'payment_processor',
            'value' => 'authorize_net',
        ]);

        $service = new PaymentService();
        
        $this->assertEquals('authorize_net', $service->getActiveProcessor());
    }

    public function test_get_active_processor_defaults_to_stripe()
    {
        Setting::where('key', 'payment_processor')->delete();
        
        $service = new PaymentService();
        
        $this->assertEquals('stripe', $service->getActiveProcessor());
    }
}
