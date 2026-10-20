<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\MembershipPeriod;
use App\Models\MembershipTier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MembershipPeriodControllerTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['roles' => ['admin']]);
    }

    private function period(Member $member, array $attrs = []): MembershipPeriod
    {
        return MembershipPeriod::create(array_merge([
            'member_id' => $member->id, 'begin_date' => '2026-01-01', 'membership_type' => 'Family',
        ], $attrs));
    }

    private function invoiceFor(Member $member): Invoice
    {
        return Invoice::factory()->create(['member_id' => $member->id]);
    }

    public function test_non_admins_are_forbidden(): void
    {
        $member = Member::factory()->create();

        $this->actingAs(User::factory()->create(['roles' => ['member']]))
            ->postJson("/admin/members/{$member->id}/membership-periods", ['begin_date' => '2026-01-01'])
            ->assertForbidden();
    }

    public function test_create_and_edit_pages_render(): void
    {
        $member = Member::factory()->create();
        $period = $this->period($member);
        $admin = $this->admin();

        $this->actingAs($admin)->get("/admin/members/{$member->id}/membership-periods/create")->assertOk();
        $this->actingAs($admin)->get("/admin/members/{$member->id}/membership-periods/{$period->id}/edit")->assertOk();
    }

    public function test_store_creates_a_period_for_the_member(): void
    {
        $member = Member::factory()->create();
        $invoice = $this->invoiceFor($member);

        $this->actingAs($this->admin())
            ->post("/admin/members/{$member->id}/membership-periods", [
                'begin_date' => '2026-01-01', 'end_date' => '2026-12-31', 'membership_type' => 'Family', 'invoice_id' => $invoice->id,
            ])
            ->assertRedirect(route('members.show', $member));

        $this->assertDatabaseHas('membership_periods', ['member_id' => $member->id, 'invoice_id' => $invoice->id, 'membership_type' => 'Family']);
    }

    public function test_store_validates_dates(): void
    {
        $member = Member::factory()->create();

        $this->actingAs($this->admin())
            ->postJson("/admin/members/{$member->id}/membership-periods", ['begin_date' => '2026-06-01', 'end_date' => '2026-01-01'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['end_date']);

        $this->actingAs($this->admin())
            ->postJson("/admin/members/{$member->id}/membership-periods", [])
            ->assertJsonValidationErrors(['begin_date']);
    }

    public function test_an_invoice_from_another_member_is_rejected(): void
    {
        $member = Member::factory()->create();
        $foreign = $this->invoiceFor(Member::factory()->create());

        $this->actingAs($this->admin())
            ->post("/admin/members/{$member->id}/membership-periods", ['begin_date' => '2026-01-01', 'invoice_id' => $foreign->id])
            ->assertSessionHasErrors('invoice_id');

        $this->assertSame(0, MembershipPeriod::count());
    }

    public function test_update_changes_the_period_and_rejects_foreign_invoices(): void
    {
        $member = Member::factory()->create();
        $period = $this->period($member);
        $admin = $this->admin();

        $this->actingAs($admin)
            ->put("/admin/members/{$member->id}/membership-periods/{$period->id}", ['begin_date' => '2026-02-01', 'membership_type' => 'Individual'])
            ->assertRedirect(route('members.show', $member));
        $this->assertSame('Individual', $period->fresh()->membership_type);

        $foreign = $this->invoiceFor(Member::factory()->create());
        $this->actingAs($admin)
            ->put("/admin/members/{$member->id}/membership-periods/{$period->id}", ['begin_date' => '2026-02-01', 'invoice_id' => $foreign->id])
            ->assertSessionHasErrors('invoice_id');
    }

    public function test_a_period_cannot_be_accessed_through_a_different_member(): void
    {
        $owner = Member::factory()->create();
        $other = Member::factory()->create();
        $period = $this->period($owner);
        $admin = $this->admin();

        $this->actingAs($admin)->get("/admin/members/{$other->id}/membership-periods/{$period->id}/edit")->assertNotFound();
        $this->actingAs($admin)->put("/admin/members/{$other->id}/membership-periods/{$period->id}", ['begin_date' => '2026-02-01'])->assertNotFound();
        $this->actingAs($admin)->delete("/admin/members/{$other->id}/membership-periods/{$period->id}")->assertNotFound();
        $this->assertDatabaseHas('membership_periods', ['id' => $period->id]);
    }

    public function test_destroy_deletes_the_period(): void
    {
        $member = Member::factory()->create();
        $period = $this->period($member);

        $this->actingAs($this->admin())
            ->delete("/admin/members/{$member->id}/membership-periods/{$period->id}")
            ->assertRedirect(route('members.show', $member));

        $this->assertDatabaseMissing('membership_periods', ['id' => $period->id]);
    }

    public function test_tier_can_be_assigned_and_is_validated_so_dues_generation_can_find_it(): void
    {
        $member = Member::factory()->create();
        $tier = MembershipTier::create(['name' => 'Family', 'slug' => 'family', 'price' => 360, 'billing_period' => 'annual', 'is_active' => true]);
        $admin = $this->admin();

        $this->actingAs($admin)
            ->post("/admin/members/{$member->id}/membership-periods", ['begin_date' => '2026-01-01', 'membership_tier_id' => $tier->id])
            ->assertRedirect(route('members.show', $member));
        $period = MembershipPeriod::where('member_id', $member->id)->sole();
        $this->assertSame($tier->id, $period->membership_tier_id);

        $this->actingAs($admin)
            ->put("/admin/members/{$member->id}/membership-periods/{$period->id}", ['begin_date' => '2026-01-01', 'membership_tier_id' => ''])
            ->assertSessionHasNoErrors();
        $this->assertNull($period->fresh()->membership_tier_id);

        $this->actingAs($admin)
            ->postJson("/admin/members/{$member->id}/membership-periods", ['begin_date' => '2026-01-01', 'membership_tier_id' => 9999])
            ->assertJsonValidationErrors(['membership_tier_id']);
    }

    public function test_forms_receive_only_active_tiers(): void
    {
        $member = Member::factory()->create();
        MembershipTier::create(['name' => 'Family', 'slug' => 'family', 'price' => 360, 'billing_period' => 'annual', 'is_active' => true]);
        MembershipTier::create(['name' => 'Retired', 'slug' => 'retired', 'price' => 1, 'billing_period' => 'annual', 'is_active' => false]);

        $this->actingAs($this->admin())
            ->get("/admin/members/{$member->id}/membership-periods/create")
            ->assertInertia(fn ($page) => $page->has('tiers', 1)->where('tiers.0.name', 'Family'));
    }
}
