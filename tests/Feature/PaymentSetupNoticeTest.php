<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\Setting;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentSetupNoticeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.stripe.public_key' => null, 'services.stripe.secret_key' => null,
            'services.paypal.client_id' => null, 'services.paypal.secret' => null,
            'services.authorize_net.api_login_id' => null, 'services.authorize_net.transaction_key' => null,
        ]);
    }

    // Online payments start off; admins are prompted to choose a processor and members see no Pay buttons.
    public function test_payments_default_to_off(): void
    {
        $this->assertSame('none', Setting::where('key', 'payment_processor')->value('value'));

        $this->actingAs(User::factory()->admin()->create())->get('/dashboard')
            ->assertInertia(fn ($page) => $page
                ->where('payments.source', 'none')
                ->where('payments.configured', false)
                ->where('onlinePayments', false));
    }

    public function test_admins_are_told_which_keys_the_chosen_processor_is_missing(): void
    {
        Setting::set('payment_processor', 'stripe');

        $this->actingAs(User::factory()->admin()->create())->get('/dashboard')
            ->assertInertia(fn ($page) => $page
                ->where('payments.configured', false)
                ->where('payments.label', 'Stripe')
                ->where('payments.source', 'settings')
                ->where('payments.missing', ['Stripe Publishable Key', 'Stripe Secret Key']));
    }

    // The old default (Stripe, no keys) moves to none; a Stripe install with keys keeps Stripe.
    public function test_the_migration_turns_off_unconfigured_stripe_only(): void
    {
        $migration = require database_path('migrations/2026_11_18_000001_default_payment_processor_to_none.php');

        Setting::set('payment_processor', 'stripe');
        $migration->up();
        $this->assertSame('none', PaymentService::activeProcessor());

        Setting::set('payment_processor', 'stripe');
        Setting::set('stripe_secret_key', 'sk_live_1');
        $migration->up();
        $this->assertSame('stripe', PaymentService::activeProcessor());
    }

    public function test_members_cannot_reach_the_payment_page_while_payments_are_off(): void
    {
        $user = User::factory()->create(['roles' => ['member']]);
        $member = Member::factory()->create(['user_id' => $user->id]);
        $invoice = Invoice::create([
            'member_id' => $member->id, 'invoice_number' => 'INV-PAY-1', 'invoice_date' => now(),
            'due_date' => now()->addMonth(), 'subtotal' => 100, 'total' => 100, 'status' => 'open',
        ]);

        $this->actingAs($user)->get("/member/invoices/{$invoice->id}/pay")
            ->assertRedirect("/member/invoices/{$invoice->id}")
            ->assertSessionHas('error');

        $this->actingAs($user)->post("/member/invoices/{$invoice->id}/pay", ['amount' => 10])
            ->assertSessionHas('error');
    }

    public function test_stripe_counts_as_set_up_from_settings_or_from_env(): void
    {
        Setting::set('payment_processor', 'stripe');
        Setting::set('stripe_public_key', 'pk_test_1');
        Setting::set('stripe_secret_key', 'sk_test_1');
        $this->assertTrue(PaymentService::setupStatus()['configured']);

        // The settings rows start blank; that must not hide keys in .env.
        Setting::set('stripe_public_key', '');
        Setting::set('stripe_secret_key', '');
        config(['services.stripe.public_key' => 'pk_env', 'services.stripe.secret_key' => 'sk_env']);
        $this->assertTrue(PaymentService::setupStatus()['configured']);
    }

    // PayPal and Authorize.Net read only .env, so keys typed into Settings don't count.
    public function test_paypal_and_authorize_net_need_env_credentials(): void
    {
        Setting::set('payment_processor', 'paypal');
        Setting::set('paypal_client_id', 'typed-in-settings');
        $status = PaymentService::setupStatus();
        $this->assertSame(['PayPal', 'env', false], [$status['label'], $status['source'], $status['configured']]);
        $this->assertSame(['PAYPAL_CLIENT_ID', 'PAYPAL_SECRET'], $status['missing']);

        config(['services.paypal.client_id' => 'id', 'services.paypal.secret' => 'secret']);
        $this->assertTrue(PaymentService::setupStatus()['configured']);

        Setting::set('payment_processor', 'authorize_net');
        $this->assertSame(['AUTHORIZE_NET_API_LOGIN_ID', 'AUTHORIZE_NET_TRANSACTION_KEY'], PaymentService::setupStatus()['missing']);
    }

    public function test_only_admins_receive_the_status(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['member']]))->get('/dashboard')
            ->assertInertia(fn ($page) => $page->where('payments', null));
    }
}
