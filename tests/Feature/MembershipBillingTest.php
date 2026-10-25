<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\MembershipPeriod;
use App\Models\MembershipTier;
use App\Models\Setting;
use App\Services\MembershipBillingService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MembershipBillingTest extends TestCase
{
    use RefreshDatabase;

    private function service(): MembershipBillingService
    {
        return app(MembershipBillingService::class);
    }

    private function enroll(array $tier = [], array $member = []): array
    {
        $tier = MembershipTier::create(array_merge([
            'name' => 'Family',
            'slug' => 'family-'.uniqid(),
            'price' => 360,
            'billing_period' => 'annual',
            'is_active' => true,
        ], $tier));

        $member = Member::factory()->create($member);

        $period = MembershipPeriod::create([
            'member_id' => $member->id,
            'membership_tier_id' => $tier->id,
            'begin_date' => now()->subYear()->toDateString(),
            'membership_type' => 'Family',
        ]);

        return [$member, $tier, $period];
    }

    private function fixedDate(string $date = '2026-09-01'): Carbon
    {
        $d = Carbon::parse($date);
        Setting::set('membership_billing_method', 'fixed_date');
        Setting::set('membership_billing_fixed_month', (string) $d->month);
        Setting::set('membership_billing_fixed_day', (string) $d->day);
        Setting::set('membership_billing_grace_period_days', '30');

        return $d;
    }

    public function test_nothing_is_generated_when_auto_generation_is_disabled(): void
    {
        Setting::set('membership_auto_generate_invoices', 'false');
        $this->enroll();

        $result = $this->service()->generateDuesInvoices(now());

        $this->assertSame(0, $result['generated']);
        $this->assertSame(0, Invoice::count());
    }

    public function test_fixed_date_billing_creates_a_correct_invoice(): void
    {
        $date = $this->fixedDate();
        [$member, $tier, $period] = $this->enroll();

        $result = $this->service()->generateDuesInvoices($date);

        $this->assertSame(1, $result['generated']);
        $invoice = Invoice::with('items')->where('member_id', $member->id)->sole();
        $this->assertEquals(360, $invoice->total);
        $this->assertSame('draft', $invoice->status);
        $this->assertSame('2026-09-01', $invoice->invoice_date->toDateString());
        $this->assertSame('2026-10-01', $invoice->due_date->toDateString());
        $this->assertSame('Family Membership Dues', $invoice->items->first()->description);

        $period->refresh();
        $this->assertSame($invoice->id, $period->invoice_id);
        $this->assertSame('2027-08-31', $period->end_date->toDateString());
        $this->assertSame('2026-09-01', $member->fresh()->last_renewal->toDateString());
    }

    public function test_running_twice_does_not_create_duplicate_invoices(): void
    {
        $date = $this->fixedDate();
        $this->enroll();

        $this->service()->generateDuesInvoices($date);
        $second = $this->service()->generateDuesInvoices($date);

        $this->assertSame(0, $second['generated']);
        $this->assertSame(1, $second['skipped']);
        $this->assertSame(1, Invoice::count());
    }

    public function test_fixed_date_billing_does_nothing_outside_the_window(): void
    {
        $this->fixedDate('2026-09-01');
        $this->enroll();

        $result = $this->service()->generateDuesInvoices(Carbon::parse('2026-03-01'));

        $this->assertSame(0, $result['generated']);
        $this->assertStringContainsString('Not within billing window', $result['message']);
        $this->assertSame(0, Invoice::count());
    }

    public function test_inactive_tiers_are_skipped(): void
    {
        $date = $this->fixedDate();
        $this->enroll(['is_active' => false]);

        $result = $this->service()->generateDuesInvoices($date);

        $this->assertSame(0, $result['generated']);
        $this->assertSame(1, $result['skipped']);
    }

    public function test_period_end_depends_on_billing_period(): void
    {
        $date = $this->fixedDate();
        [, , $monthly] = $this->enroll(['billing_period' => 'monthly']);
        [, , $lifetime] = $this->enroll(['billing_period' => 'lifetime']);

        $this->service()->generateDuesInvoices($date);

        $this->assertSame('2026-09-30', $monthly->fresh()->end_date->toDateString());
        $this->assertSame('2126-09-01', $lifetime->fresh()->end_date->toDateString());
    }

    public function test_anniversary_billing_invoices_members_whose_anniversary_is_near(): void
    {
        Setting::set('membership_billing_method', 'anniversary');
        Setting::set('membership_billing_grace_period_days', '30');
        [$due] = $this->enroll([], ['last_renewal' => now()->subYear()->toDateString()]);
        [$notDue] = $this->enroll([], ['last_renewal' => now()->subMonths(6)->toDateString()]);

        $result = $this->service()->generateDuesInvoices(now());

        $this->assertSame(1, $result['generated']);
        $this->assertSame(1, Invoice::where('member_id', $due->id)->count());
        $this->assertSame(0, Invoice::where('member_id', $notDue->id)->count());
    }

    public function test_members_due_for_renewal_follows_the_billing_method(): void
    {
        $date = $this->fixedDate();
        [$member] = $this->enroll();

        $this->assertTrue($this->service()->getMembersDueForRenewal($date)->contains('id', $member->id));
        $this->assertTrue($this->service()->getMembersDueForRenewal(Carbon::parse('2026-03-01'))->isEmpty());

        Setting::set('membership_billing_method', 'anniversary');
        $this->assertTrue($this->service()->getMembersDueForRenewal(now())->isEmpty());

        $member->update(['last_renewal' => now()->subYear()->toDateString()]);
        $this->assertTrue($this->service()->getMembersDueForRenewal(now())->contains('id', $member->id));
    }

    public function test_dues_command_dry_run_creates_nothing(): void
    {
        $this->fixedDate();
        $this->enroll();

        $this->artisan('membership:generate-dues', ['--date' => '2026-09-01', '--dry-run' => true])
            ->expectsOutputToContain('DRY RUN MODE')
            ->assertSuccessful();

        $this->assertSame(0, Invoice::count());
    }

    public function test_dues_command_generates_invoices_and_force_overrides_the_setting(): void
    {
        $this->fixedDate();
        Setting::set('membership_auto_generate_invoices', 'false');
        $this->enroll();

        $this->artisan('membership:generate-dues', ['--date' => '2026-09-01'])->assertSuccessful();
        $this->assertSame(0, Invoice::count());

        $this->artisan('membership:generate-dues', ['--date' => '2026-09-01', '--force' => true])
            ->expectsOutputToContain('Generated: 1')
            ->assertSuccessful();
        $this->assertSame(1, Invoice::count());
    }
}
