<?php

namespace App\Services;

use App\Mail\TorahHonorMail;
use App\Models\GabbaiAssignment;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Emails Torah honorees and records when each one was told, so nobody is emailed twice.
 */
class HonorEmailService
{
    /**
     * @param  iterable<GabbaiAssignment>  $assignments  with member loaded
     * @return array{sent: int, no_email: list<string>, failed: list<string>}
     */
    public function send(iterable $assignments, bool $reminder): array
    {
        $result = ['sent' => 0, 'no_email' => [], 'failed' => []];

        foreach ($assignments as $assignment) {
            $member = $assignment->member;

            if (! $member) {
                continue; // honor left unassigned
            }

            $name = trim("{$member->first_name} {$member->last_name}");

            if (! $member->email) {
                $result['no_email'][] = $name;

                continue;
            }

            try {
                Mail::to($member->email)->send(new TorahHonorMail($assignment, $reminder));
                $assignment->forceFill([$reminder ? 'reminded_at' : 'notified_at' => now()])->save();
                $result['sent']++;
            } catch (Throwable $e) {
                report($e);
                $result['failed'][] = $name;
            }
        }

        return $result;
    }
}
