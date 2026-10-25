<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\CampaignEmail;
use App\Models\EmailCampaign;
use App\Models\Form;
use App\Models\Invoice;
use App\Models\Meeting;
use App\Models\Member;
use App\Models\MemberRelationship;
use App\Models\MembershipPeriod;
use App\Models\Payment;
use App\Models\Report;
use App\Models\RideRequest;
use App\Models\SeatAssignment;
use App\Models\SeatingChart;
use App\Models\SeatingSeason;
use App\Models\Yahrzeit;
use Database\Seeders\MemberTimelineSeeder;
use Database\Seeders\SeatingSeeder;
use Database\Seeders\YahrzeitSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_yahrzeit_seed_is_idempotent(): void
    {
        $this->seed(YahrzeitSeeder::class);
        $this->seed(YahrzeitSeeder::class);

        $this->assertCount(39, Yahrzeit::withCount('members')->get());
        $this->assertSame(6, Member::where('email', 'like', '%.yahrzeit-demo@example.test')->count());
        $this->assertSame(4, MemberRelationship::count());
        $this->assertTrue(Yahrzeit::withCount('members')->get()->every(
            fn (Yahrzeit $yahrzeit) => $yahrzeit->members_count === 3
        ));
    }

    public function test_member_join_dates_are_spread_over_the_past_twelve_months(): void
    {
        $this->seed();

        $dates = Member::orderBy('created_at')->pluck('created_at');

        $this->assertTrue($dates->first()->gte(now()->subMonths(12)->startOfDay()));
        $this->assertTrue($dates->last()->lt(now()));
        $this->assertGreaterThanOrEqual(10, $dates->groupBy(fn ($d) => $d->format('Y-m'))->count());
        $this->assertSame(Member::count(), Member::whereColumn('created_at', 'updated_at')->count());
    }

    public function test_default_seed_includes_contacts_prospects_and_former_members(): void
    {
        $this->seed();

        foreach (['contact', 'prospect', 'former'] as $type) {
            $this->assertGreaterThan(0, Member::where('member_type', $type)->count(), $type);
        }
    }

    public function test_member_timeline_seeder_does_nothing_without_members(): void
    {
        $this->seed(MemberTimelineSeeder::class);

        $this->assertSame(0, Member::count());
    }

    public function test_default_seed_creates_connected_demo_data_for_core_workflows(): void
    {
        $this->seed();

        $this->assertGreaterThanOrEqual(15, Member::count());
        $this->assertGreaterThanOrEqual(15, MembershipPeriod::count());
        $this->assertGreaterThanOrEqual(5, Invoice::count());
        $this->assertGreaterThanOrEqual(1, Payment::where('status', 'completed')->count());
        $this->assertGreaterThanOrEqual(1, Payment::where('status', 'pending')->count());
        $this->assertGreaterThanOrEqual(1, Payment::where('status', 'failed')->count());
        $this->assertGreaterThanOrEqual(2, Meeting::count());
        $this->assertGreaterThanOrEqual(2, Report::count());
        $this->assertGreaterThanOrEqual(1, Form::has('submissions')->count());
        $this->assertGreaterThanOrEqual(1, EmailCampaign::has('campaignEmails')->count());
        $this->assertGreaterThanOrEqual(2, CampaignEmail::count());
        $this->assertGreaterThanOrEqual(1, RideRequest::whereNotNull('driver_id')->count());
        $this->assertGreaterThanOrEqual(1, Banner::whereNotNull('created_by')->count());
        $seededYahrzeits = Yahrzeit::query()
            ->where('notes', 'Demo yahrzeit record; linked to the sample family.')
            ->withCount('members')
            ->get();
        $this->assertCount(39, $seededYahrzeits);

        foreach ([
            'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Adar II', 'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul',
        ] as $month) {
            $this->assertSame(3, $seededYahrzeits->where('hebrew_month_of_death', $month)->count());
        }

        $this->assertTrue($seededYahrzeits->every(fn (Yahrzeit $yahrzeit) => $yahrzeit->members_count === 3));
        $this->assertGreaterThanOrEqual(4, MemberRelationship::count());
        $this->assertNotNull(
            Invoice::where('invoice_number', 'INV-000001')->firstOrFail()
                ->items()->whereNotNull('gl_account_id')->first()
        );
    }

    public function test_default_seed_includes_a_demo_seating_chart_mid_sale(): void
    {
        Storage::fake('public');

        $this->seed();

        $chart = SeatingChart::where('image_path', SeatingSeeder::IMAGE_PATH)->sole();
        Storage::disk('public')->assertExists($chart->image_path);
        $this->assertSame(160, $chart->seats()->count());
        $this->assertSame(3, $chart->sections()->count());
        $this->assertSame(4, $chart->seats()->where('is_accessible', true)->count());

        [$lastYear, $upcoming] = SeatingSeason::orderBy('first_service_date')->get()->all();
        $this->assertTrue($lastYear->first_service_date->isPast());
        $this->assertTrue($upcoming->first_service_date->isFuture());
        $this->assertTrue($upcoming->isOpenForMembers());
        $this->assertTrue($upcoming->isRenewalWindowOpen());

        $this->assertGreaterThanOrEqual(80, $lastYear->assignments()->where('status', SeatAssignment::STATUS_RESERVED)->count());
        $lastYearInvoices = $lastYear->invoices();
        $this->assertGreaterThan(0, (clone $lastYearInvoices)->where('status', 'paid')->count());
        $this->assertGreaterThan(0, (clone $lastYearInvoices)->where('status', 'open')->count());
        $this->assertSame(1, (clone $lastYearInvoices)->where('status', 'partial')->count());

        // Renewals in progress: confirmed, still pending, and newcomers buying at non-member prices.
        $this->assertGreaterThan(10, $upcoming->assignments()->where('status', SeatAssignment::STATUS_RESERVED)->count());
        $this->assertGreaterThan(1, $upcoming->assignments()->where('status', SeatAssignment::STATUS_RENEWAL)->count());
        $this->assertGreaterThan(0, $upcoming->assignments()->where('pricing', SeatAssignment::PRICING_NONMEMBER)->count());
        $this->assertGreaterThan(0, $upcoming->invoices()->where('status', 'paid')->count());

        // The member portal demo account sees its seats held for renewal.
        $portalMember = Member::where('email', SeatingSeeder::PORTAL_MEMBER_EMAIL)->sole();
        $this->assertSame(3, $upcoming->assignments()->where('member_id', $portalMember->id)->where('status', SeatAssignment::STATUS_RENEWAL)->count());
    }

    public function test_seating_seed_runs_standalone_and_is_idempotent(): void
    {
        Storage::fake('public');

        $this->seed(SeatingSeeder::class);
        $this->seed(SeatingSeeder::class);

        $this->assertSame(1, SeatingChart::count());
        $this->assertSame(2, SeatingSeason::count());
        $this->assertGreaterThan(0, SeatAssignment::count());
    }
}
