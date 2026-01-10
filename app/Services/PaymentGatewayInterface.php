<?php

namespace App\Services;

interface PaymentGatewayInterface
{
    /**
     * Process a payment
     *
     * @param float $amount
     * @param array $paymentDetails
     * @return array
     */
    public function processPayment(float $amount, array $paymentDetails): array;

    /**
     * Refund a payment
     *
     * @param string $transactionId
     * @param float|null $amount
     * @return array
     */
    public function refundPayment(string $transactionId, ?float $amount = null): array;

    /**
     * Get payment details
     *
     * @param string $transactionId
     * @return array
     */
    public function getPaymentDetails(string $transactionId): array;
}
