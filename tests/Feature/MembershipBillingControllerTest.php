<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\MembershipPeriod;
use App\Models\MembershipTier;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MembershipBillingControllerTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['roles' => ['admin']]);
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'billing_method' => 'fixed_date',
            'fixed_month' => 9,
            'fixed_day' => 1,
            'grace_period_days' => 14,
            'auto_generate' => true,
            'invoice_due_days' => 21,
        ], $overrides);
    }

    public function test_non_admins_cannot_access_billing_settings(): void
    {
        $user = User::factory()->create(['roles' => ['member']]);

        $this->actingAs($user)->putJson('/admin/settings/membership-billing', $this->validPayload())->assertForbidden();
        $this->actingAs($user)->getJson('/admin/settings/membership-billing/preview')->assertForbidden();
        $this->actingAs($user)->postJson('/admin/settings/membership-billing/generate')->assertForbidden();
    }

    public function test_admin_can_update_settings(): void
    {
        $this->actingAs($this->admin())
            ->put('/admin/settings/membership-billing', $this->validPayload())
            ->assertRedirect(route('settings.membership-billing'));

        $this->assertSame('fixed_date', Setting::get('membership_billing_method'));
        $this->assertSame('9', Setting::get('membership_billing_fixed_month'));
        $this->assertSame('14', Setting::get('membership_billing_grace_period_days'));
        $this->assertSame('true', Setting::get('membership_auto_generate_invoices'));
        $this->assertSame('21', Setting::get('membership_invoice_due_days'));
    }

    public function test_update_validates_input(): void
    {
        $this->actingAs($this->admin())
            ->putJson('/admin/settings/membership-billing', $this->validPayload([
                'billing_method' => 'weekly', 'fixed_month' => 13, 'fixed_day' => 0, 'invoice_due_days' => 0,
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['billing_method', 'fixed_month', 'fixed_day', 'invoice_due_days']);
    }

    public function test_preview_lists_members_due_for_renewal(): void
    {
        Setting::set('membership_billing_method', 'fixed_date');
        Setting::set('membership_billing_fixed_month', '9');
        Setting::set('membership_billing_fixed_day', '1');
        $tier = MembershipTier::create(['name' => 'Family', 'slug' => 'family', 'price' => 360, 'billing_period' => 'annual', 'is_active' => true]);
        $member = Member::factory()->create();
        MembershipPeriod::create(['member_id' => $member->id, 'membership_tier_id' => $tier->id, 'begin_date' => now()->subYear()->toDateString(), 'membership_type' => 'Family']);

        $this->actingAs($this->admin())
            ->getJson('/admin/settings/membership-billing/preview?date=2026-09-01')
            ->assertOk()
            ->assertJsonPath('count', 1)
            ->assertJsonPath('date', '2026-09-01')
            ->assertJsonPath('members.0.id', $member->id)
            ->assertJsonPath('members.0.tiers.0.name', 'Family');
    }

    public function test_generate_creates_invoices_and_flashes_the_result(): void
    {
        Setting::set('membership_billing_method', 'fixed_date');
        Setting::set('membership_billing_fixed_month', '9');
        Setting::set('membership_billing_fixed_day', '1');
        $tier = MembershipTier::create(['name' => 'Family', 'slug' => 'family', 'price' => 360, 'billing_period' => 'annual', 'is_active' => true]);
        $member = Member::factory()->create();
        MembershipPeriod::create(['member_id' => $member->id, 'membership_tier_id' => $tier->id, 'begin_date' => now()->subYear()->toDateString(), 'membership_type' => 'Family']);

        $this->actingAs($this->admin())
            ->post('/admin/settings/membership-billing/generate', ['date' => '2026-09-01'])
            ->assertRedirect(route('settings.membership-billing'))
            ->assertSessionHas('success');

        $this->assertSame(1, Invoice::where('member_id', $member->id)->count());
    }
}
