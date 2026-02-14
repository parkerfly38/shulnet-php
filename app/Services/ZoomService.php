<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ZoomService
{
    private Client $client;
    private ?string $accountId;
    private ?string $clientId;
    private ?string $clientSecret;
    private ?string $accessToken = null;

    public function __construct()
    {
        $this->client = new Client();
        $this->accountId = config('services.zoom.account_id');
        $this->clientId = config('services.zoom.client_id');
        $this->clientSecret = config('services.zoom.client_secret');
    }

    /**
     * Check if Zoom integration is enabled.
     */
    public function isEnabled(): bool
    {
        $settingsService = app(SettingsService::class);
        
        return $settingsService->get('zoom_enabled', false) 
            && !empty($this->accountId)
            && !empty($this->clientId)
            && !empty($this->clientSecret);
    }

    /**
     * Get OAuth access token using Server-to-Server OAuth.
     */
    private function getAccessToken(): ?string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        try {
            $response = $this->client->post('https://zoom.us/oauth/token', [
                'auth' => [$this->clientId, $this->clientSecret],
                'form_params' => [
                    'grant_type' => 'account_credentials',
                    'account_id' => $this->accountId,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $this->accessToken = $data['access_token'] ?? null;

            return $this->accessToken;
        } catch (GuzzleException $e) {
            Log::error('Zoom OAuth error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a Zoom meeting.
     *
     * @param array $data Meeting data
     * @return array|null Meeting details including meeting_id and join_url
     */
    public function createMeeting(array $data): ?array
    {
        if (!$this->isEnabled()) {
            return null;
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return null;
        }

        try {
            $userId = config('services.zoom.user_id', 'me');
            
            $meetingData = [
                'topic' => $data['topic'] ?? 'Meeting',
                'type' => 2, // Scheduled meeting
                'start_time' => $data['start_time'] ?? now()->toIso8601String(),
                'duration' => $data['duration'] ?? 60,
                'timezone' => $data['timezone'] ?? config('app.timezone', 'America/New_York'),
                'agenda' => $data['agenda'] ?? '',
                'settings' => [
                    'host_video' => true,
                    'participant_video' => true,
                    'join_before_host' => false,
                    'mute_upon_entry' => true,
                    'watermark' => false,
                    'approval_type' => $data['approval_type'] ?? 2, // No registration required
                    'registration_type' => $data['registration_type'] ?? 1,
                    'audio' => 'both',
                    'auto_recording' => 'none',
                ],
            ];

            // Add registration if required
            if ($data['registration_required'] ?? false) {
                $meetingData['settings']['approval_type'] = 0; // Automatic approval
                $meetingData['settings']['registration_type'] = 1; // Attendees register once
            }

            $response = $this->client->post("https://api.zoom.us/v2/users/{$userId}/meetings", [
                'headers' => [
                    'Authorization' => "Bearer {$token}",
                    'Content-Type' => 'application/json',
                ],
                'json' => $meetingData,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            return [
                'meeting_id' => $result['id'] ?? null,
                'meeting_number' => $result['id'] ?? null,
                'join_url' => $result['join_url'] ?? null,
                'start_url' => $result['start_url'] ?? null,
                'password' => $result['password'] ?? null,
                'registration_url' => $result['registration_url'] ?? null,
            ];
        } catch (GuzzleException $e) {
            Log::error('Zoom create meeting error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Update a Zoom meeting.
     *
     * @param string $meetingId Zoom meeting ID
     * @param array $data Updated meeting data
     * @return bool Success status
     */
    public function updateMeeting(string $meetingId, array $data): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return false;
        }

        try {
            $meetingData = [
                'topic' => $data['topic'] ?? null,
                'start_time' => $data['start_time'] ?? null,
                'duration' => $data['duration'] ?? null,
                'timezone' => $data['timezone'] ?? null,
                'agenda' => $data['agenda'] ?? null,
            ];

            // Remove null values
            $meetingData = array_filter($meetingData, fn($value) => $value !== null);

            $this->client->patch("https://api.zoom.us/v2/meetings/{$meetingId}", [
                'headers' => [
                    'Authorization' => "Bearer {$token}",
                    'Content-Type' => 'application/json',
                ],
                'json' => $meetingData,
            ]);

            return true;
        } catch (GuzzleException $e) {
            Log::error('Zoom update meeting error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a Zoom meeting.
     *
     * @param string $meetingId Zoom meeting ID
     * @return bool Success status
     */
    public function deleteMeeting(string $meetingId): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return false;
        }

        try {
            $this->client->delete("https://api.zoom.us/v2/meetings/{$meetingId}", [
                'headers' => [
                    'Authorization' => "Bearer {$token}",
                ],
            ]);

            return true;
        } catch (GuzzleException $e) {
            Log::error('Zoom delete meeting error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Add a registrant to a Zoom meeting.
     *
     * @param string $meetingId Zoom meeting ID
     * @param array $registrant Registrant data
     * @return array|null Registration details
     */
    public function addRegistrant(string $meetingId, array $registrant): ?array
    {
        if (!$this->isEnabled()) {
            return null;
        }

        $token = $this->getAccessToken();
        if (!$token) {
            return null;
        }

        try {
            $registrantData = [
                'email' => $registrant['email'],
                'first_name' => $registrant['first_name'] ?? '',
                'last_name' => $registrant['last_name'] ?? '',
                'phone' => $registrant['phone'] ?? '',
            ];

            $response = $this->client->post("https://api.zoom.us/v2/meetings/{$meetingId}/registrants", [
                'headers' => [
                    'Authorization' => "Bearer {$token}",
                    'Content-Type' => 'application/json',
                ],
                'json' => $registrantData,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            return [
                'registrant_id' => $result['registrant_id'] ?? null,
                'join_url' => $result['join_url'] ?? null,
            ];
        } catch (GuzzleException $e) {
            Log::error('Zoom add registrant error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate meeting duration from start and end times.
     *
     * @param Carbon $start
     * @param Carbon $end
     * @return int Duration in minutes
     */
    public function calculateDuration(Carbon $start, Carbon $end): int
    {
        return max(1, (int) $start->diffInMinutes($end));
    }
}
