<?php

namespace App\Services;

use App\Models\Setting;

class PaymentService
{
    protected PaymentGatewayInterface $gateway;

    public function __construct()
    {
        $processor = Setting::where('key', 'payment_processor')->value('value') ?? 'stripe';
        
        $this->gateway = match ($processor) {
            'authorize_net' => new AuthorizeNetPaymentGateway(),
            'paypal' => new PayPalPaymentGateway(),
            default => new StripePaymentGateway(),
        };
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
        return Setting::where('key', 'payment_processor')->value('value') ?? 'stripe';
    }
}
