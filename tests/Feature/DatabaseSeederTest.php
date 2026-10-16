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
use App\Models\Yahrzeit;
use Database\Seeders\YahrzeitSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar'
            , 'Adar II', 'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul',
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
}
