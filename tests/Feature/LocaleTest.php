<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_locale_follows_the_cookie(): void
    {
        $this->withUnencryptedCookie('locale', 'he')
            ->get('/login')
            ->assertOk()
            ->assertSee('lang="he"', false)
            ->assertSee('dir="rtl"', false);
    }

    public function test_unsupported_locale_falls_back_to_default(): void
    {
        $this->withUnencryptedCookie('locale', 'xx')
            ->get('/login')
            ->assertSee('lang="en"', false);
    }

    public function test_user_can_change_locale(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/settings/locale', ['locale' => 'es'])
            ->assertRedirect()
            ->assertCookie('locale');

        $this->assertSame('es', $user->fresh()->locale);
    }

    public function test_invalid_locale_is_rejected(): void
    {
        $this->actingAs(User::factory()->create())
            ->patch('/settings/locale', ['locale' => 'fr'])
            ->assertSessionHasErrors('locale');
    }
}
