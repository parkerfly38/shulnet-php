<?php

namespace Tests\Feature;

use App\Mail\YahrzeitReminderMail;
use App\Models\Member;
use App\Models\PdfTemplate;
use App\Models\User;
use App\Models\Yahrzeit;
use App\Services\YahrzeitLetterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class YahrzeitMonthlyLettersTest extends TestCase
{
    use RefreshDatabase;

    private function yahrzeit(): Yahrzeit
    {
        $yahrzeit = Yahrzeit::factory()->create([
            'name' => 'Sarah Cohen',
            'hebrew_day_of_death' => 1,
            'hebrew_month_of_death' => 'Cheshvan',
            'notes' => null,
        ]);
        $yahrzeit->members()->attach(Member::factory()->create(['first_name' => 'David', 'email' => 'david@example.com']), ['relationship' => 'Son']);

        return $yahrzeit;
    }

    // The dashboard sends the month by name, the same way yahrzeits store it.
    public function test_monthly_letters_print_for_a_month_name(): void
    {
        $yahrzeit = $this->yahrzeit();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/admin/yahrzeits/monthly/print', ['yahrzeit_ids' => [$yahrzeit->id], 'month' => 'Cheshvan'])
            ->assertOk()
            ->assertSee('Monthly Yahrzeit Letters - Cheshvan')
            ->assertSee('1 Cheshvan')
            ->assertSee('Sarah Cohen');
    }

    public function test_monthly_reminders_email_for_a_month_name(): void
    {
        Mail::fake();
        $yahrzeit = $this->yahrzeit();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/admin/yahrzeits/monthly/send', ['yahrzeit_ids' => [$yahrzeit->id], 'month' => 'Cheshvan'])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        Mail::assertSent(YahrzeitReminderMail::class, 1);
    }

    public function test_letters_and_emails_use_the_editable_template(): void
    {
        $yahrzeit = $this->yahrzeit();
        PdfTemplate::where('slug', YahrzeitLetterService::TEMPLATE_SLUG)->sole()->update([
            'html_content' => '<p>Shalom {{member_first_name}}, remembering {{deceased_name}} ({{relationship}}) on {{gregorian_date}}.</p>'
                .'{{#if notes}}<p>Notes: {{notes}}</p>{{/if}}',
        ]);
        $admin = User::factory()->admin()->create();
        $member = $yahrzeit->members()->sole();

        $this->actingAs($admin)
            ->post('/admin/yahrzeits/monthly/print', ['yahrzeit_ids' => [$yahrzeit->id], 'month' => 'Cheshvan'])
            ->assertOk()
            ->assertSee('Shalom David, remembering Sarah Cohen (son)', false)
            ->assertDontSee('Notes:');

        $this->actingAs($admin)
            ->get("/admin/yahrzeits/{$yahrzeit->id}/print-reminder?member_ids={$member->id}&gregorian_date=October+12,+2026")
            ->assertOk()
            ->assertSee('Shalom David, remembering Sarah Cohen (son) on October 12, 2026.', false);

        $yahrzeit->update(['notes' => '<b>Kaddish</b> at minyan']);
        $html = (new YahrzeitReminderMail($yahrzeit->fresh(), 'October 12, 2026', 'David Cohen', $member))->render();
        $this->assertStringContainsString('Shalom David', $html);
        $this->assertStringContainsString('Notes: &lt;b&gt;Kaddish&lt;/b&gt; at minyan', $html);
    }

    public function test_default_design_is_used_when_the_template_is_turned_off(): void
    {
        $yahrzeit = $this->yahrzeit();
        PdfTemplate::where('slug', YahrzeitLetterService::TEMPLATE_SLUG)->update(['is_active' => false]);

        $html = (new YahrzeitReminderMail($yahrzeit, 'October 12, 2026', 'David Cohen', $yahrzeit->members()->sole()))->render();

        $this->assertStringContainsString('Memorial Observance Reminder', $html);
        $this->assertStringContainsString('1 Cheshvan', $html);
        $this->assertStringNotContainsString('{{', $html);
    }
}
