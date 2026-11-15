<?php

namespace Tests\Feature;

use App\Mail\TorahHonorMail;
use App\Models\GabbaiAssignment;
use App\Models\Member;
use App\Models\PdfTemplate;
use App\Models\Setting;
use App\Models\User;
use App\Services\HonorLetterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TorahHonorNotificationsTest extends TestCase
{
    use RefreshDatabase;

    private const DATE = '2026-11-21';

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function save(array $assignments, bool $notify = false)
    {
        return $this->actingAs($this->admin())->postJson('/api/admin/gabbai/assignments', [
            'date' => self::DATE,
            'notify' => $notify,
            'assignments' => $assignments,
        ]);
    }

    public function test_plain_save_sends_nothing(): void
    {
        Mail::fake();
        $member = Member::factory()->create(['email' => 'david@example.com']);

        $this->save([['honor' => '3', 'member_id' => $member->id]])->assertOk();

        Mail::assertNothingSent();
        $this->assertNull(GabbaiAssignment::sole()->notified_at);
    }

    public function test_save_and_notify_emails_each_honoree_once(): void
    {
        Mail::fake();
        $david = Member::factory()->create(['email' => 'david@example.com']);
        $sarah = Member::factory()->create(['email' => 'sarah@example.com']);

        $this->save([['honor' => '1', 'member_id' => $david->id]], notify: true)
            ->assertOk()
            ->assertJsonPath('notified.sent', 1);

        // Adding Sarah and notifying again emails only her.
        $this->save([['honor' => '1', 'member_id' => $david->id], ['honor' => '2', 'member_id' => $sarah->id]], notify: true)
            ->assertJsonPath('notified.sent', 1);

        Mail::assertSent(TorahHonorMail::class, 2);
        Mail::assertSent(TorahHonorMail::class, fn ($mail) => $mail->hasTo('sarah@example.com') && ! $mail->reminder);
    }

    public function test_changing_an_honors_member_makes_it_new_again(): void
    {
        Mail::fake();
        $david = Member::factory()->create(['email' => 'david@example.com']);
        $sarah = Member::factory()->create(['email' => 'sarah@example.com']);

        $this->save([['honor' => 'M', 'member_id' => $david->id]], notify: true);
        $this->save([['honor' => 'M', 'member_id' => $sarah->id]], notify: true)->assertJsonPath('notified.sent', 1);

        Mail::assertSent(TorahHonorMail::class, fn ($mail) => $mail->hasTo('sarah@example.com'));
        $this->assertSame($sarah->id, GabbaiAssignment::sole()->member_id);
    }

    public function test_saving_keeps_unchanged_honors_and_drops_removed_ones(): void
    {
        $david = Member::factory()->create();
        $this->save([['honor' => '1', 'member_id' => $david->id], ['honor' => '2', 'member_id' => null]]);
        $original = GabbaiAssignment::where('honor', '1')->sole();
        $original->update(['notified_at' => now()]);

        $this->save([['honor' => '1', 'member_id' => $david->id]])->assertOk();

        $kept = GabbaiAssignment::sole();
        $this->assertSame($original->id, $kept->id);
        $this->assertNotNull($kept->notified_at);
    }

    public function test_members_without_email_are_reported_not_emailed(): void
    {
        Mail::fake();
        $member = Member::factory()->create(['first_name' => 'Sam', 'last_name' => 'Levy', 'email' => null]);

        $this->save([['honor' => '4', 'member_id' => $member->id]], notify: true)
            ->assertJsonPath('notified.sent', 0)
            ->assertJsonPath('notified.no_email', ['Sam Levy']);

        Mail::assertNothingSent();
    }

    public function test_reminder_button_emails_everyone_on_the_date(): void
    {
        Mail::fake();
        $member = Member::factory()->create(['email' => 'david@example.com']);
        GabbaiAssignment::create(['date' => self::DATE, 'honor' => '5', 'member_id' => $member->id, 'notified_at' => now()]);

        $this->actingAs($this->admin())
            ->postJson('/api/admin/gabbai/reminders', ['date' => self::DATE])
            ->assertOk()
            ->assertJsonPath('reminded.sent', 1);

        Mail::assertSent(TorahHonorMail::class, fn ($mail) => $mail->reminder);
        $this->assertNotNull(GabbaiAssignment::sole()->reminded_at);
    }

    public function test_letter_uses_the_template_with_honor_details(): void
    {
        $this->assertTrue(PdfTemplate::where('slug', HonorLetterService::TEMPLATE_SLUG)->exists());
        $member = Member::factory()->create(['first_name' => 'David', 'last_name' => 'Cohen']);
        GabbaiAssignment::create([
            'date' => self::DATE, 'honor' => '3', 'member_id' => $member->id,
            'portion' => 'Vayetzei', 'reading' => 'Genesis 28:10-29:17',
        ]);

        $this->actingAs($this->admin())
            ->get('/admin/gabbai/honors/letters?date='.self::DATE.'&type=reminder')
            ->assertOk()
            ->assertSee('Torah Honor Reminders')
            ->assertSee('Dear David Cohen')
            ->assertSee('Aliyah 3 (Shlishi)')
            ->assertSee('Saturday, November 21, 2026')
            ->assertSee('Vayetzei')
            ->assertSee('friendly reminder')
            ->assertDontSee('pleased to let you know');
    }

    public function test_nightly_command_reminds_within_the_window_and_skips_fresh_notices(): void
    {
        Mail::fake();
        Setting::set('honor_reminder_days_before', '5');
        Carbon::setTestNow('2026-11-16 08:00:00');

        $member = fn () => Member::factory()->create(['email' => fake()->unique()->safeEmail()]);
        $due = GabbaiAssignment::create(['date' => '2026-11-21', 'honor' => '1', 'member_id' => $member()->id, 'notified_at' => '2026-11-01 10:00:00']);
        $toldThisWeek = GabbaiAssignment::create(['date' => '2026-11-21', 'honor' => '2', 'member_id' => $member()->id, 'notified_at' => '2026-11-16 07:00:00']);
        $tooFar = GabbaiAssignment::create(['date' => '2026-11-28', 'honor' => '1', 'member_id' => $member()->id]);
        $alreadyReminded = GabbaiAssignment::create(['date' => '2026-11-21', 'honor' => '3', 'member_id' => $member()->id, 'reminded_at' => '2026-11-15 08:00:00']);

        $this->artisan('honors:send-reminders')->assertSuccessful();

        Mail::assertSent(TorahHonorMail::class, 1);
        $this->assertNotNull($due->fresh()->reminded_at);
        $this->assertNull($toldThisWeek->fresh()->reminded_at);
        $this->assertNull($tooFar->fresh()->reminded_at);
        $this->assertSame('2026-11-15 08:00:00', $alreadyReminded->fresh()->reminded_at->toDateTimeString());
    }

    public function test_nightly_command_does_nothing_when_turned_off(): void
    {
        Mail::fake();
        Setting::set('honor_reminder_days_before', '0');
        GabbaiAssignment::create(['date' => today()->addDay(), 'honor' => '1', 'member_id' => Member::factory()->create(['email' => 'a@example.com'])->id]);

        $this->artisan('honors:send-reminders')->assertSuccessful();

        Mail::assertNothingSent();
    }
}
