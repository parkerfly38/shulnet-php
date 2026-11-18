<?php

namespace App\Console\Commands;

use App\Models\GabbaiAssignment;
use App\Services\HonorEmailService;
use App\Services\SettingsService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendHonorReminders extends Command
{
    protected $signature = 'honors:send-reminders
                            {--date= : Treat this date as today (Y-m-d format, defaults to today)}
                            {--dry-run : List who would be reminded without sending anything}';

    protected $description = 'Email Torah honorees a reminder the configured number of days before their service';

    /**
     * Reminds everyone whose honor falls between today and the reminder window's end and who hasn't been
     * reminded yet, so a missed run catches up the next night. Someone first told about their honor inside
     * the window already has the details fresh, so they aren't reminded again.
     */
    public function handle(HonorEmailService $emails, SettingsService $settings): int
    {
        $days = (int) $settings->get('honor_reminder_days_before', 5);

        if ($days <= 0) {
            $this->info('Honor reminders are turned off (honor_reminder_days_before is 0).');

            return self::SUCCESS;
        }

        $today = $this->option('date') ? Carbon::parse($this->option('date'))->startOfDay() : today();
        $windowEnd = $today->copy()->addDays($days);

        $due = GabbaiAssignment::with('member')
            ->whereNotNull('member_id')
            ->whereNull('reminded_at')
            ->whereBetween('date', [$today->toDateString(), $windowEnd->toDateString()])
            ->orderBy('date')
            ->orderBy('id')
            ->get()
            ->reject(fn ($a) => $a->notified_at && $a->notified_at->gte($a->date->copy()->subDays($days)));

        $this->info("Honors from {$today->toDateString()} to {$windowEnd->toDateString()} due a reminder: {$due->count()}");

        if ($this->option('dry-run')) {
            foreach ($due as $a) {
                $this->line("  - {$a->date->toDateString()} {$a->honor}: ".trim("{$a->member?->first_name} {$a->member?->last_name}"));
            }

            return self::SUCCESS;
        }

        $result = $emails->send($due, reminder: true);

        $this->info("Sent {$result['sent']} reminder(s).");

        if ($result['no_email']) {
            $this->warn('No email address on file: '.implode(', ', $result['no_email']));
        }

        if ($result['failed']) {
            $this->error('Failed to send to: '.implode(', ', $result['failed']));

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
