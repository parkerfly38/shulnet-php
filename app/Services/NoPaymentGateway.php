<?php

namespace App\Services;

/**
 * Used while no payment processor is chosen, so online payment attempts fail cleanly.
 */
class NoPaymentGateway implements PaymentGatewayInterface
{
    private const MESSAGE = 'Online payments are not set up.';

    public function processPayment(float $amount, array $paymentDetails): array
    {
        return ['success' => false, 'error' => self::MESSAGE];
    }

    public function refundPayment(string $transactionId, ?float $amount = null): array
    {
        return ['success' => false, 'error' => self::MESSAGE];
    }

    public function getPaymentDetails(string $transactionId): array
    {
        return ['success' => false, 'error' => self::MESSAGE];
    }
}
