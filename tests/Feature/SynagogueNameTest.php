<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\PdfTemplate;
use App\Models\Setting;
use App\Models\User;
use App\Models\Yahrzeit;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class SynagogueNameTest extends TestCase
{
    use RefreshDatabase;

    // The migration seeds the setting from APP_NAME so nothing changes on upgrade.
    public function test_setting_starts_as_the_app_name_and_leads_general_settings(): void
    {
        $this->assertSame(config('app.name'), Setting::where('key', 'site_name')->value('value'));

        $this->actingAs(User::factory()->admin()->create())
            ->get('/admin/settings')
            ->assertInertia(fn ($page) => $page->where('settings.general.0.key', 'site_name'));
    }

    // Dashboards show the name and prompt admins while it's blank or still a product default.
    public function test_pages_share_the_name_and_whether_it_still_needs_setting(): void
    {
        $admin = User::factory()->admin()->create();

        foreach (['', 'ShulNET', 'Shulnet Portal', ' laravel '] as $placeholder) {
            Setting::set('site_name', $placeholder);
            $this->actingAs($admin)->get('/dashboard')
                ->assertInertia(fn ($page) => $page->where('organization.needs_setup', true));
        }

        Setting::set('site_name', 'Temple Beth Shalom');
        $this->actingAs($admin)->get('/dashboard')
            ->assertInertia(fn ($page) => $page
                ->where('organization.name', 'Temple Beth Shalom')
                ->where('organization.needs_setup', false));
    }

    public function test_blank_setting_falls_back_to_the_app_name(): void
    {
        Setting::set('site_name', '   ');

        $this->assertSame(config('app.name'), app(SettingsService::class)->organizationName());
    }

    public function test_yahrzeit_letters_use_the_synagogue_name(): void
    {
        Setting::set('site_name', 'Temple Beth Shalom');
        $yahrzeit = Yahrzeit::factory()->create(['hebrew_day_of_death' => 1, 'hebrew_month_of_death' => 'Cheshvan', 'notes' => null]);
        $yahrzeit->members()->attach(Member::factory()->create(), ['relationship' => 'Son']);

        $this->actingAs(User::factory()->admin()->create())
            ->post('/admin/yahrzeits/monthly/print', ['yahrzeit_ids' => [$yahrzeit->id], 'month' => 'Cheshvan'])
            ->assertOk()
            ->assertSee('Temple Beth Shalom');
    }

    // Works in any template, whether or not it lists the placeholder as a field.
    public function test_pdf_templates_fill_a_blank_synagogue_name(): void
    {
        Setting::set('site_name', 'Temple Beth Shalom & Friends');
        $template = PdfTemplate::create([
            'name' => 'Letter', 'slug' => 'letter', 'category' => 'letter', 'is_active' => true,
            'html_content' => '<p>{{synagogue_name}} / {{organization_name}}</p>',
            'available_fields' => [['name' => 'synagogue_name', 'label' => 'Synagogue Name', 'type' => 'text', 'default_value' => 'Our Synagogue']],
        ]);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson("/admin/pdf-templates/{$template->id}/preview", ['field_values' => ['synagogue_name' => '']])
            ->assertJsonPath('html', '<p>Temple Beth Shalom &amp; Friends / Temple Beth Shalom &amp; Friends</p>');

        $this->actingAs($admin)
            ->postJson("/admin/pdf-templates/{$template->id}/preview", ['field_values' => ['synagogue_name' => 'Typed Name']])
            ->assertJsonPath('html', '<p>Typed Name / Temple Beth Shalom &amp; Friends</p>');

        $this->actingAs($admin)
            ->get("/admin/pdf-templates/{$template->id}")
            ->assertInertia(fn ($page) => $page->where('template.available_fields.0.default_value', 'Temple Beth Shalom & Friends'));
    }

    // Laravel's built-in emails sign off with the app name; they should use the setting.
    public function test_password_reset_email_uses_the_synagogue_name(): void
    {
        Setting::set('site_name', 'Temple Beth Shalom');
        $user = User::factory()->create();

        Password::sendResetLink(['email' => $user->email]);

        $messages = app('mailer')->getSymfonyTransport()->messages();
        $this->assertCount(1, $messages);
        $this->assertStringContainsString('Temple Beth Shalom', $messages[0]->getOriginalMessage()->getHtmlBody());
    }
}
