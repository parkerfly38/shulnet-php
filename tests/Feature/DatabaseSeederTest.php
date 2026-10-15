<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\CampaignEmail;
use App\Models\EmailCampaign;
use App\Models\Form;
use App\Models\Invoice;
use App\Models\Meeting;
use App\Models\Member;
use App\Models\MembershipPeriod;
use App\Models\Payment;
use App\Models\Report;
use App\Models\RideRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

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
        $this->assertNotNull(
            Invoice::where('invoice_number', 'INV-000001')->firstOrFail()
                ->items()->whereNotNull('gl_account_id')->first()
        );
    }
}
