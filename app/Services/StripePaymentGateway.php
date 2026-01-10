<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Exception;

class StripePaymentGateway implements PaymentGatewayInterface
{
    protected string $secretKey;

    public function __construct()
    {
        $this->secretKey = config('services.stripe.secret_key') ?: '';
        Stripe::setApiKey($this->secretKey);
    }

    public function processPayment(float $amount, array $paymentDetails): array
    {
        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount * 100, // Convert to cents
                'currency' => 'usd',
                'payment_method' => $paymentDetails['payment_method_id'] ?? null,
                'confirm' => true,
                'automatic_payment_methods' => [
                    'enabled' => true,
                    'allow_redirects' => 'never',
                ],
                'description' => $paymentDetails['description'] ?? 'Invoice Payment',
                'metadata' => [
                    'invoice_id' => $paymentDetails['invoice_id'] ?? null,
                    'member_id' => $paymentDetails['member_id'] ?? null,
                ],
            ]);

            return [
                'success' => true,
                'transaction_id' => $paymentIntent->id,
                'status' => $paymentIntent->status,
                'details' => $paymentIntent->toArray(),
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function refundPayment(string $transactionId, ?float $amount = null): array
    {
        try {
            $refundData = ['payment_intent' => $transactionId];
            
            if ($amount !== null) {
                $refundData['amount'] = $amount * 100; // Convert to cents
            }

            $refund = Refund::create($refundData);

            return [
                'success' => true,
                'refund_id' => $refund->id,
                'status' => $refund->status,
                'details' => $refund->toArray(),
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function getPaymentDetails(string $transactionId): array
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($transactionId);

            return [
                'success' => true,
                'details' => $paymentIntent->toArray(),
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
