<?php

namespace App\Services;

use net\authorize\api\contract\v1 as AnetAPI;
use net\authorize\api\controller as AnetController;
use Exception;

class AuthorizeNetPaymentGateway implements PaymentGatewayInterface
{
    protected string $apiLoginId;
    protected string $transactionKey;
    protected string $environment;

    public function __construct()
    {
        $this->apiLoginId = config('services.authorize_net.api_login_id') ?: '';
        $this->transactionKey = config('services.authorize_net.transaction_key') ?: '';
        $this->environment = config('services.authorize_net.environment', 'sandbox');
    }

    public function processPayment(float $amount, array $paymentDetails): array
    {
        try {
            // Set the transaction's reference ID
            $refId = 'ref' . time();

            // Create the payment object
            $creditCard = new AnetAPI\CreditCardType();
            $creditCard->setCardNumber($paymentDetails['card_number']);
            $creditCard->setExpirationDate($paymentDetails['expiration_date']);
            $creditCard->setCardCode($paymentDetails['cvv']);

            $paymentOne = new AnetAPI\PaymentType();
            $paymentOne->setCreditCard($creditCard);

            // Create the transaction request
            $transactionRequestType = new AnetAPI\TransactionRequestType();
            $transactionRequestType->setTransactionType('authCaptureTransaction');
            $transactionRequestType->setAmount($amount);
            $transactionRequestType->setPayment($paymentOne);

            // Create the request
            $request = new AnetAPI\CreateTransactionRequest();
            $request->setMerchantAuthentication($this->getMerchantAuthentication());
            $request->setRefId($refId);
            $request->setTransactionRequest($transactionRequestType);

            // Execute the request
            $controller = new AnetController\CreateTransactionController($request);
            $response = $controller->executeWithApiResponse(
                $this->environment === 'production' 
                    ? \net\authorize\api\constants\ANetEnvironment::PRODUCTION 
                    : \net\authorize\api\constants\ANetEnvironment::SANDBOX
            );

            if ($response != null) {
                if ($response->getMessages()->getResultCode() == 'Ok') {
                    $tresponse = $response->getTransactionResponse();

                    if ($tresponse != null && $tresponse->getMessages() != null) {
                        return [
                            'success' => true,
                            'transaction_id' => $tresponse->getTransId(),
                            'status' => 'completed',
                            'details' => [
                                'auth_code' => $tresponse->getAuthCode(),
                                'message' => $tresponse->getMessages()[0]->getDescription(),
                            ],
                        ];
                    }
                }

                $errorMessages = $response->getMessages()->getMessage();
                return [
                    'success' => false,
                    'error' => $errorMessages[0]->getText(),
                ];
            }

            return [
                'success' => false,
                'error' => 'No response from Authorize.NET',
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
            $refId = 'ref' . time();

            // Create the payment object (you would need to get the last 4 digits from storage)
            $creditCard = new AnetAPI\CreditCardType();
            $creditCard->setCardNumber('XXXX'); // Last 4 digits
            $creditCard->setExpirationDate('XXXX');

            $paymentOne = new AnetAPI\PaymentType();
            $paymentOne->setCreditCard($creditCard);

            // Create the transaction request
            $transactionRequestType = new AnetAPI\TransactionRequestType();
            $transactionRequestType->setTransactionType('refundTransaction');
            $transactionRequestType->setAmount($amount);
            $transactionRequestType->setPayment($paymentOne);
            $transactionRequestType->setRefTransId($transactionId);

            // Create the request
            $request = new AnetAPI\CreateTransactionRequest();
            $request->setMerchantAuthentication($this->getMerchantAuthentication());
            $request->setRefId($refId);
            $request->setTransactionRequest($transactionRequestType);

            // Execute the request
            $controller = new AnetController\CreateTransactionController($request);
            $response = $controller->executeWithApiResponse(
                $this->environment === 'production' 
                    ? \net\authorize\api\constants\ANetEnvironment::PRODUCTION 
                    : \net\authorize\api\constants\ANetEnvironment::SANDBOX
            );

            if ($response != null && $response->getMessages()->getResultCode() == 'Ok') {
                $tresponse = $response->getTransactionResponse();

                return [
                    'success' => true,
                    'refund_id' => $tresponse->getTransId(),
                    'status' => $tresponse->getResponseCode(),
                    'details' => [
                        'message' => $tresponse->getMessages()[0]->getDescription(),
                    ],
                ];
            }

            $errorMessages = $response->getMessages()->getMessage();
            return [
                'success' => false,
                'error' => $errorMessages[0]->getText(),
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
            $request = new AnetAPI\GetTransactionDetailsRequest();
            $request->setMerchantAuthentication($this->getMerchantAuthentication());
            $request->setTransId($transactionId);

            $controller = new AnetController\GetTransactionDetailsController($request);
            $response = $controller->executeWithApiResponse(
                $this->environment === 'production' 
                    ? \net\authorize\api\constants\ANetEnvironment::PRODUCTION 
                    : \net\authorize\api\constants\ANetEnvironment::SANDBOX
            );

            if ($response != null && $response->getMessages()->getResultCode() == 'Ok') {
                return [
                    'success' => true,
                    'details' => $response->getTransaction(),
                ];
            }

            return [
                'success' => false,
                'error' => 'Transaction not found',
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    protected function getMerchantAuthentication(): AnetAPI\MerchantAuthenticationType
    {
        $merchantAuthentication = new AnetAPI\MerchantAuthenticationType();
        $merchantAuthentication->setName($this->apiLoginId);
        $merchantAuthentication->setTransactionKey($this->transactionKey);

        return $merchantAuthentication;
    }
}
