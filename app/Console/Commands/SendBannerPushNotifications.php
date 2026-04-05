<?php

namespace App\Console\Commands;

use App\Models\Banner;
use App\Models\User;
use App\Services\FirebaseService;
use Illuminate\Console\Command;

class SendBannerPushNotifications extends Command
{
    protected $signature = 'banners:send-push-notifications';
    protected $description = 'Send push notifications for pending banners';

    public function handle(FirebaseService $firebaseService)
    {
        $this->info('Checking for pending banner push notifications...');

        // Get banners that need to be sent as push notifications
        $banners = Banner::active()
            ->where('send_as_push_notification', true)
            ->whereNull('push_notification_sent_at')
            ->where('start_date', '<=', now())
            ->get();

        if ($banners->isEmpty()) {
            $this->info('No pending push notifications.');
            return 0;
        }

        $this->info("Found {$banners->count()} banner(s) to send.");

        foreach ($banners as $banner) {
            $this->info("Processing: {$banner->title}");

            // Get users who should receive this banner
            $users = $this->getUsersForBanner($banner);

            if ($users->isEmpty()) {
                $this->warn("No users found for audience: {$banner->target_audience}");
                $banner->update(['push_notification_sent_at' => now()]);
                continue;
            }

            $this->info("Sending to {$users->count()} user(s)...");

            // Send push notification
            $results = $firebaseService->sendBannerNotification($banner, $users);

            $this->info("Results: {$results['success']} sent, {$results['failed']} failed out of {$results['total']} total");
        }

        $this->info('Done!');
        return 0;
    }

    protected function getUsersForBanner(Banner $banner): \Illuminate\Support\Collection
    {
        $query = User::whereHas('activeDeviceTokens');

        switch ($banner->target_audience) {
            case 'members':
                $query->whereHas('member');
                break;
            case 'students':
                $query->whereHas('member.students');
                break;
            case 'parents':
                $query->whereHas('member.parent');
                break;
            case 'all':
            default:
                // No additional filtering
                break;
        }

        return $query->get();
    }
}
