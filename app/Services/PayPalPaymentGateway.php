<?php

namespace App\Services;

use PaypalServerSdkLib\Logging\LoggingConfigurationBuilder;
use PaypalServerSdkLib\Logging\RequestLoggingConfigurationBuilder;
use PaypalServerSdkLib\Logging\ResponseLoggingConfigurationBuilder;
use Psr\Log\LogLevel;
use PaypalServerSdkLib\Environment;
use PaypalServerSdkLib\Authentication\ClientCredentialsAuthCredentialsBuilder;
use PaypalServerSdkLib\PaypalServerSdkClientBuilder;
use Exception;

class PayPalPaymentGateway implements PaymentGatewayInterface
{
    private const PREFER_REPRESENTATION = 'return=representation';
    
    protected $client;
    protected string $mode;
    protected string $currency;

    public function __construct()
    {
        $clientId = config('services.paypal.client_id') ?: '';
        $clientSecret = config('services.paypal.secret') ?: '';
        $this->mode = config('services.paypal.mode', 'sandbox');
        // Default currency can be set in config/services.php as 'paypal.currency'
        // Fallback to USD
        $this->currency = strtoupper(config('services.paypal.currency', 'USD'));

        $env = $this->mode === 'production' ? Environment::PRODUCTION : Environment::SANDBOX;

        $this->client = PaypalServerSdkClientBuilder::init()
            ->clientCredentialsAuthCredentials(
                ClientCredentialsAuthCredentialsBuilder::init($clientId, $clientSecret)
            )
            ->environment($env)
            ->loggingConfiguration(
                LoggingConfigurationBuilder::init()
                    ->level(LogLevel::INFO)
                    ->requestConfiguration(RequestLoggingConfigurationBuilder::init()->body(false))
                    ->responseConfiguration(ResponseLoggingConfigurationBuilder::init()->headers(false))
            )
            ->build();
    }

    public function processPayment(float $amount, array $paymentDetails): array
    {
        try {
            // If we have an order_id, capture it
            if (isset($paymentDetails['order_id'])) {
                return $this->captureOrder($paymentDetails['order_id']);
            }

            // Otherwise create a new order via OrdersController
            $ordersController = $this->client->getOrdersController();

            $currency = strtoupper($paymentDetails['currency'] ?? $this->currency ?? 'USD');

            $purchaseUnit = [
                'reference_id' => $paymentDetails['reference_id'] ?? $paymentDetails['invoice_id'] ?? 'default',
                'amount' => [
                    'currency_code' => $currency,
                    'value' => number_format($amount, 2, '.', ''),
                ],
            ];

            if (!empty($paymentDetails['invoice_id'])) {
                $purchaseUnit['invoice_id'] = $paymentDetails['invoice_id'];
            }

            if (!empty($paymentDetails['custom_id'])) {
                $purchaseUnit['custom_id'] = $paymentDetails['custom_id'];
            }

            if (!empty($paymentDetails['description'])) {
                $purchaseUnit['description'] = $paymentDetails['description'];
            }

            if (!empty($paymentDetails['items']) && is_array($paymentDetails['items'])) {
                $purchaseUnit['items'] = $paymentDetails['items'];
            }

            // Allow metadata/custom fields via soft_descriptor or custom_id where supported
            $body = [
                'intent' => 'CAPTURE',
                'purchase_units' => [ $purchaseUnit ],
                'application_context' => [
                    'brand_name' => config('app.name'),
                    'locale' => 'en-US',
                    'landing_page' => 'BILLING',
                    'user_action' => 'PAY_NOW',
                ],
            ];

            $collect = [
                'body' => $body,
                'prefer' => self::PREFER_REPRESENTATION,
            ];

            $apiResponse = $ordersController->createOrder($collect);
            $result = $apiResponse->getResult();

            return [
                'success' => true,
                'order_id' => $result->id ?? null,
                'status' => $result->status ?? null,
                'details' => $result,
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
            $ordersController = $this->client->getOrdersController();

            $collect = [
                'id' => $orderId,
                'prefer' => self::PREFER_REPRESENTATION,
            ];

            $apiResponse = $ordersController->captureOrder($collect);
            $result = $apiResponse->getResult();

            $captureId = $result->purchase_units[0]->payments->captures[0]->id ?? null;

            return [
                'success' => true,
                'transaction_id' => $captureId,
                'order_id' => $result->id ?? null,
                'status' => $result->status ?? null,
                'details' => $result,
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
            $paymentsController = $this->client->getPaymentsController();

            $collect = [
                'captureId' => $transactionId,
                'prefer' => self::PREFER_REPRESENTATION,
            ];

            if ($amount !== null) {
                $currency = strtoupper($this->currency ?? config('services.paypal.currency', 'USD'));
                $collect['body'] = [
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => number_format($amount, 2, '.', ''),
                    ],
                ];
            }

            $apiResponse = $paymentsController->refundCapturedPayment($collect);
            $result = $apiResponse->getResult();

            return [
                'success' => true,
                'refund_id' => $result->id ?? null,
                'status' => $result->status ?? null,
                'details' => $result,
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
            // Try to get as an order
            $ordersController = $this->client->getOrdersController();
            $apiResponse = $ordersController->getOrder(['id' => $transactionId]);
            $result = $apiResponse->getResult();

            return [
                'success' => true,
                'details' => $result,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
