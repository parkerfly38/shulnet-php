<?php

namespace App\Services;

use App\Models\Setting;

class PaymentService
{
    /** Selectable processors; "none" (the default) turns online payments off. */
    public const PROCESSORS = ['none', 'stripe', 'authorize_net', 'paypal'];

    protected PaymentGatewayInterface $gateway;

    public function __construct()
    {
        $this->gateway = match (self::activeProcessor()) {
            'stripe' => new StripePaymentGateway,
            'authorize_net' => new AuthorizeNetPaymentGateway,
            'paypal' => new PayPalPaymentGateway,
            default => new NoPaymentGateway,
        };
    }

    /**
     * The processor chosen in Settings; anything blank or unrecognized counts as none.
     */
    public static function activeProcessor(): string
    {
        $processor = (string) Setting::where('key', 'payment_processor')->value('value');

        return in_array($processor, self::PROCESSORS, true) ? $processor : 'none';
    }

    /**
     * Whether members can pay online: a processor is chosen and has its credentials.
     */
    public static function onlinePaymentsEnabled(): bool
    {
        return self::setupStatus()['configured'];
    }

    public function getGateway(): PaymentGatewayInterface
    {
        return $this->gateway;
    }

    public function processPayment(float $amount, array $paymentDetails): array
    {
        return $this->gateway->processPayment($amount, $paymentDetails);
    }

    public function refundPayment(string $transactionId, ?float $amount = null): array
    {
        return $this->gateway->refundPayment($transactionId, $amount);
    }

    public function getPaymentDetails(string $transactionId): array
    {
        return $this->gateway->getPaymentDetails($transactionId);
    }

    public function getActiveProcessor(): string
    {
        return self::activeProcessor();
    }

    /**
     * Whether the selected processor has the credentials its gateway actually reads, so admins can be
     * told before a member hits a failed payment. Stripe reads Settings, falling back to .env;
     * PayPal and Authorize.Net read only .env.
     *
     * @return array{processor: string, label: string, configured: bool, source: 'none'|'settings'|'env', missing: list<string>}
     */
    public static function setupStatus(): array
    {
        $settings = Setting::whereIn('key', ['payment_processor', 'stripe_public_key', 'stripe_secret_key'])->pluck('value', 'key');
        $processor = in_array($settings['payment_processor'] ?? null, self::PROCESSORS, true) ? $settings['payment_processor'] : 'none';

        if ($processor === 'none') {
            return ['processor' => 'none', 'label' => 'None', 'configured' => false, 'source' => 'none', 'missing' => []];
        }

        $required = match ($processor) {
            'authorize_net' => [
                'AUTHORIZE_NET_API_LOGIN_ID' => config('services.authorize_net.api_login_id'),
                'AUTHORIZE_NET_TRANSACTION_KEY' => config('services.authorize_net.transaction_key'),
            ],
            'paypal' => [
                'PAYPAL_CLIENT_ID' => config('services.paypal.client_id'),
                'PAYPAL_SECRET' => config('services.paypal.secret'),
            ],
            'stripe' => [
                'Stripe Publishable Key' => ($settings['stripe_public_key'] ?? null) ?: config('services.stripe.public_key'),
                'Stripe Secret Key' => ($settings['stripe_secret_key'] ?? null) ?: config('services.stripe.secret_key'),
            ],
        };

        $missing = array_keys(array_filter($required, fn ($value) => trim((string) $value) === ''));

        return [
            'processor' => $processor,
            'label' => match ($processor) {
                'authorize_net' => 'Authorize.Net',
                'paypal' => 'PayPal',
                default => 'Stripe',
            },
            'configured' => $missing === [],
            'source' => in_array($processor, ['authorize_net', 'paypal'], true) ? 'env' : 'settings',
            'missing' => $missing,
        ];
    }
}
