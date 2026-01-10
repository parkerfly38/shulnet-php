<?php

namespace App\Services;

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;
use PayPalCheckoutSdk\Orders\OrdersGetRequest;
use PayPalCheckoutSdk\Payments\CapturesRefundRequest;
use Exception;

class PayPalPaymentGateway implements PaymentGatewayInterface
{
    protected PayPalHttpClient $client;
    protected string $mode;

    public function __construct()
    {
        $clientId = config('services.paypal.client_id') ?: '';
        $clientSecret = config('services.paypal.secret') ?: '';
        $this->mode = config('services.paypal.mode', 'sandbox');

        $environment = $this->mode === 'production'
            ? new ProductionEnvironment($clientId, $clientSecret)
            : new SandboxEnvironment($clientId, $clientSecret);

        $this->client = new PayPalHttpClient($environment);
    }

    public function processPayment(float $amount, array $paymentDetails): array
    {
        try {
            // If we have an order_id, capture it
            if (isset($paymentDetails['order_id'])) {
                return $this->captureOrder($paymentDetails['order_id']);
            }

            // Otherwise create a new order
            $request = new OrdersCreateRequest();
            $request->prefer('return=representation');
            $request->body = [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'reference_id' => $paymentDetails['invoice_id'] ?? 'default',
                        'amount' => [
                            'currency_code' => 'USD',
                            'value' => number_format($amount, 2, '.', ''),
                        ],
                        'description' => $paymentDetails['description'] ?? 'Invoice Payment',
                    ],
                ],
                'application_context' => [
                    'brand_name' => config('app.name'),
                    'locale' => 'en-US',
                    'landing_page' => 'BILLING',
                    'user_action' => 'PAY_NOW',
                ],
            ];

            $response = $this->client->execute($request);

            return [
                'success' => true,
                'order_id' => $response->result->id,
                'status' => $response->result->status,
                'details' => $response->result,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    protected function captureOrder(string $orderId): array
    {
        try {
            $request = new OrdersCaptureRequest($orderId);
            $request->prefer('return=representation');

            $response = $this->client->execute($request);

            $captureId = $response->result->purchase_units[0]->payments->captures[0]->id ?? null;

            return [
                'success' => true,
                'transaction_id' => $captureId,
                'order_id' => $response->result->id,
                'status' => $response->result->status,
                'details' => $response->result,
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
            $request = new CapturesRefundRequest($transactionId);
            $request->prefer('return=representation');

            $requestBody = [];
            if ($amount !== null) {
                $requestBody['amount'] = [
                    'currency_code' => 'USD',
                    'value' => number_format($amount, 2, '.', ''),
                ];
            }

            if (!empty($requestBody)) {
                $request->body = $requestBody;
            }

            $response = $this->client->execute($request);

            return [
                'success' => true,
                'refund_id' => $response->result->id,
                'status' => $response->result->status,
                'details' => $response->result,
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
            // TransactionId could be an order ID
            $request = new OrdersGetRequest($transactionId);
            $response = $this->client->execute($request);

            return [
                'success' => true,
                'details' => $response->result,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
