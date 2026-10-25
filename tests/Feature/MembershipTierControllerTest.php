<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MembershipPeriod;
use App\Models\MembershipTier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MembershipTierControllerTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['roles' => ['admin']]);
    }

    private function tier(array $attrs = []): MembershipTier
    {
        return MembershipTier::create(array_merge([
            'name' => 'Family', 'slug' => 'family', 'price' => 360, 'billing_period' => 'annual', 'is_active' => true,
        ], $attrs));
    }

    public function test_non_admins_are_forbidden(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['member']]))
            ->getJson('/admin/membership-tiers')->assertForbidden();
    }

    public function test_index_returns_tiers_with_stats(): void
    {
        $this->tier();
        $this->tier(['name' => 'Retired', 'slug' => 'retired', 'price' => 100, 'is_active' => false]);

        $this->actingAs($this->admin())->get('/admin/membership-tiers')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/membership-tiers/index')
                ->has('tiers', 2)
                ->where('stats.total', 2)
                ->where('stats.active', 1)
                ->where('stats.totalRevenue', 360));
    }

    public function test_store_generates_slug_and_applies_defaults(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/membership-tiers', ['name' => 'Young Professional', 'price' => 180, 'billing_period' => 'annual'])
            ->assertRedirect(route('membership-tiers.index'));

        $tier = MembershipTier::where('name', 'Young Professional')->sole();
        $this->assertSame('young-professional', $tier->slug);
        $this->assertTrue($tier->is_active);
        $this->assertSame(0, $tier->sort_order);
    }

    public function test_store_validates_input_and_unique_slug(): void
    {
        $this->tier();

        $this->actingAs($this->admin())
            ->postJson('/admin/membership-tiers', ['name' => '', 'price' => -1, 'billing_period' => 'weekly', 'slug' => 'family'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'price', 'billing_period', 'slug']);
    }

    public function test_update_changes_the_tier_and_allows_keeping_its_own_slug(): void
    {
        $tier = $this->tier();

        $this->actingAs($this->admin())
            ->put("/admin/membership-tiers/{$tier->id}", ['name' => 'Family Plus', 'slug' => 'family', 'price' => 400, 'billing_period' => 'monthly'])
            ->assertRedirect(route('membership-tiers.index'));

        $tier->refresh();
        $this->assertSame('Family Plus', $tier->name);
        $this->assertEquals(400, $tier->price);
        $this->assertSame('monthly', $tier->billing_period);
    }

    public function test_pages_render(): void
    {
        $tier = $this->tier();
        $admin = $this->admin();

        $this->actingAs($admin)->get('/admin/membership-tiers/create')->assertOk();
        $this->actingAs($admin)->get("/admin/membership-tiers/{$tier->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('admin/membership-tiers/show')->where('tier.id', $tier->id));
        $this->actingAs($admin)->get("/admin/membership-tiers/{$tier->id}/edit")->assertOk();
    }

    public function test_tier_in_use_cannot_be_deleted_but_unused_tier_can(): void
    {
        $used = $this->tier();
        $unused = $this->tier(['name' => 'Spare', 'slug' => 'spare']);
        MembershipPeriod::create([
            'member_id' => Member::factory()->create()->id, 'membership_tier_id' => $used->id,
            'begin_date' => now()->toDateString(), 'membership_type' => 'Family',
        ]);
        $admin = $this->admin();

        $this->actingAs($admin)->delete("/admin/membership-tiers/{$used->id}")->assertSessionHas('error');
        $this->assertDatabaseHas('membership_tiers', ['id' => $used->id]);

        $this->actingAs($admin)->delete("/admin/membership-tiers/{$unused->id}")
            ->assertRedirect(route('membership-tiers.index'));
        $this->assertDatabaseMissing('membership_tiers', ['id' => $unused->id]);
    }
}
