<?php

namespace App\Services;

interface PaymentGatewayInterface
{
    /**
     * Process a payment
     */
    public function processPayment(float $amount, array $paymentDetails): array;

    /**
     * Refund a payment
     */
    public function refundPayment(string $transactionId, ?float $amount = null): array;

    /**
     * Get payment details
     */
    public function getPaymentDetails(string $transactionId): array;
}
