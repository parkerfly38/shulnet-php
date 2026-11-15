<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsPageTest extends TestCase
{
    use RefreshDatabase;

    // Membership billing and email are edited on their own pages, so General Settings leaves them out.
    public function test_groups_with_their_own_pages_are_not_listed(): void
    {
        Setting::updateOrCreate(['key' => 'smtp_host'], ['value' => 'smtp.example.com', 'group' => 'email', 'type' => 'text']);
        Setting::updateOrCreate(['key' => 'membership_billing_method'], ['value' => 'anniversary', 'group' => 'membership', 'type' => 'select']);

        $this->actingAs(User::factory()->admin()->create())
            ->get('/admin/settings')
            ->assertInertia(fn ($page) => $page
                ->has('settings.general')
                ->missing('settings.email')
                ->missing('settings.membership'));
    }

    // Saving General Settings sends only what it lists, so membership billing keeps its values.
    public function test_saving_general_settings_leaves_membership_billing_alone(): void
    {
        Setting::set('membership_billing_method', 'fixed_date');

        $this->actingAs(User::factory()->admin()->create())
            ->put('/admin/settings', ['settings' => ['site_name' => 'Temple Beth Shalom']])
            ->assertSessionHasNoErrors();

        $this->assertSame('fixed_date', Setting::get('membership_billing_method'));
    }
}
