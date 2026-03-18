<?php

namespace App\Services;

use App\Models\Banner;
use App\Models\DeviceToken;
use App\Models\PushNotificationLog;
use App\Models\User;
use Illuminate\Support\Collection;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Firebase\Exception\MessagingException;

class FirebaseService
{
    protected $messaging;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount(config('firebase.credentials'));
        $this->messaging = $factory->createMessaging();
    }

    /**
     * Send push notification for a banner to specific users
     */
    public function sendBannerNotification(Banner $banner, Collection $users): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'total' => 0,
        ];

        foreach ($users as $user) {
            $deviceTokens = $user->activeDeviceTokens;
            
            foreach ($deviceTokens as $deviceToken) {
                $results['total']++;
                $result = $this->sendToDevice($banner, $user, $deviceToken);
                
                if ($result['success']) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                }
            }
        }

        // Mark banner as sent
        $banner->update(['push_notification_sent_at' => now()]);

        return $results;
    }

    /**
     * Send notification to a specific device
     */
    protected function sendToDevice(Banner $banner, User $user, DeviceToken $deviceToken): array
    {
        try {
            $notification = Notification::create(
                $banner->title,
                $banner->message
            );

            $data = array_merge(
                [
                    'banner_id' => (string) $banner->id,
                    'type' => $banner->type,
                    'action_url' => $banner->action_url ?? '',
                ],
                $banner->push_notification_data ?? []
            );

            $message = CloudMessage::withTarget('token', $deviceToken->token)
                ->withNotification($notification)
                ->withData($data);

            if ($banner->action_url) {
                // Add click action for Android
                $message = $message->withAndroidConfig([
                    'notification' => [
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    ],
                ]);
            }

            $this->messaging->send($message);

            // Log success
            PushNotificationLog::create([
                'banner_id' => $banner->id,
                'user_id' => $user->id,
                'device_token' => $deviceToken->token,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $deviceToken->markAsUsed();

            return ['success' => true];

        } catch (MessagingException $e) {
            // Handle specific Firebase errors
            $errorCode = $e->errors()[0]['errorCode'] ?? 'unknown';
            
            // Deactivate token if it's invalid
            if (in_array($errorCode, ['INVALID_ARGUMENT', 'NOT_FOUND', 'UNREGISTERED'])) {
                $deviceToken->deactivate();
            }

            // Log failure
            PushNotificationLog::create([
                'banner_id' => $banner->id,
                'user_id' => $user->id,
                'device_token' => $deviceToken->token,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'sent_at' => now(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send notification to specific tokens
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): array
    {
        try {
            $notification = Notification::create($title, $body);
            
            $message = CloudMessage::new()
                ->withNotification($notification)
                ->withData($data);

            $result = $this->messaging->sendMulticast($message, $tokens);

            return [
                'success' => $result->successes()->count(),
                'failed' => $result->failures()->count(),
            ];

        } catch (MessagingException $e) {
            return [
                'success' => 0,
                'failed' => count($tokens),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate a device token
     */
    public function validateToken(string $token): bool
    {
        try {
            $this->messaging->validateRegistrationTokens([$token]);
            return true;
        } catch (MessagingException $e) {
            return false;
        }
    }
}