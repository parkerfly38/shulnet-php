<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_user_management_page(): void
    {
        $admin = User::factory()->create([
            'roles' => [UserRole::Admin],
        ]);

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_access_user_management_page(): void
    {
        $user = User::factory()->create([
            'roles' => [UserRole::Member],
        ]);

        $response = $this->actingAs($user)->get('/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_fetch_user_list(): void
    {
        $admin = User::factory()->create(['roles' => [UserRole::Admin]]);

        // Create some test users
        User::factory()->create(['roles' => [UserRole::Teacher]]);
        User::factory()->create(['roles' => [UserRole::Student]]);
        User::factory()->create(['roles' => [UserRole::Parent, UserRole::Member]]);

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertStatus(200);

        // Assert Inertia props contain user data
        $response->assertInertia(fn ($page) => $page
            ->component('admin/users')
            ->has('users.data', 4) // 3 created + 1 admin
            ->has('available_roles')
            ->has('filters')
        );
    }

    public function test_non_admin_cannot_fetch_user_list(): void
    {
        $user = User::factory()->create(['roles' => [UserRole::Teacher]]);

        $response = $this->actingAs($user)->get('/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_update_user_roles(): void
    {
        $admin = User::factory()->create(['roles' => [UserRole::Admin]]);
        $targetUser = User::factory()->create(['roles' => [UserRole::Member]]);

        $response = $this->actingAs($admin)->put("/api/admin/users/{$targetUser->id}/roles", [
            'roles' => ['teacher', 'parent'],
        ]);

        $response->assertStatus(200);

        $targetUser->refresh();
        $this->assertTrue($targetUser->hasRole(UserRole::Teacher));
        $this->assertTrue($targetUser->hasRole(UserRole::Parent));
        $this->assertFalse($targetUser->hasRole(UserRole::Member));
    }

    public function test_admin_can_search_users(): void
    {
        $admin = User::factory()->create(['roles' => [UserRole::Admin]]);

        $john = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
        $jane = User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);

        // Search by name
        $response = $this->actingAs($admin)->get('/admin/users?search=John');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => $page
            ->where('filters.search', 'John')
            ->has('users.data')
        );
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $admin = User::factory()->create(['roles' => [UserRole::Admin]]);

        $teacher = User::factory()->create(['roles' => [UserRole::Teacher]]);
        $student = User::factory()->create(['roles' => [UserRole::Student]]);

        // Filter by teacher role
        $response = $this->actingAs($admin)->get('/admin/users?role=teacher');
        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => $page
            ->where('filters.role', 'teacher')
            ->has('users.data')
        );
    }

    public function test_unauthenticated_user_cannot_access_admin_routes(): void
    {
        $response = $this->get('/admin/users');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_email_a_password_reset_link(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->post("/admin/users/{$user->id}/password-reset-link")
            ->assertRedirect()
            ->assertSessionHas('success');

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_admin_can_set_a_password_and_sign_the_user_out(): void
    {
        config(['session.driver' => 'database']);
        $user = User::factory()->create();
        $user->createToken('phone');
        DB::table('sessions')->insert(['id' => 'old-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);

        $this->actingAs(User::factory()->admin()->create())
            ->put("/admin/users/{$user->id}/password", ['password' => 'Correct-Horse-9', 'password_confirmation' => 'Correct-Horse-9'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertTrue(Hash::check('Correct-Horse-9', $user->fresh()->password));
        $this->assertDatabaseMissing('sessions', ['id' => 'old-session']);
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_set_password_requires_confirmation(): void
    {
        $user = User::factory()->create();
        $original = $user->password;

        $this->actingAs(User::factory()->admin()->create())
            ->put("/admin/users/{$user->id}/password", ['password' => 'Correct-Horse-9', 'password_confirmation' => 'nope'])
            ->assertSessionHasErrors('password');

        $this->assertSame($original, $user->fresh()->password);
    }

    public function test_non_admins_cannot_reset_passwords(): void
    {
        $user = User::factory()->create();
        $member = User::factory()->create(['roles' => [UserRole::Member]]);

        $this->actingAs($member)->post("/admin/users/{$user->id}/password-reset-link")->assertForbidden();
        $this->actingAs($member)->put("/admin/users/{$user->id}/password", ['password' => 'x', 'password_confirmation' => 'x'])->assertForbidden();
    }

    public function test_admin_can_remove_a_users_two_factor_authentication(): void
    {
        $user = User::factory()->create();
        $user->forceFill([
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['code-1'])),
            'two_factor_confirmed_at' => now(),
        ])->save();
        $this->assertTrue($user->hasEnabledTwoFactorAuthentication());

        $this->actingAs(User::factory()->admin()->create())
            ->delete("/admin/users/{$user->id}/two-factor")
            ->assertRedirect()
            ->assertSessionHas('success');

        $user->refresh();
        $this->assertFalse($user->hasEnabledTwoFactorAuthentication());
        $this->assertNull($user->two_factor_secret);
        $this->assertNull($user->two_factor_recovery_codes);
    }

    public function test_non_admins_cannot_remove_two_factor_authentication(): void
    {
        $user = User::factory()->create(['two_factor_secret' => encrypt('secret'), 'two_factor_confirmed_at' => now()]);
        $member = User::factory()->create(['roles' => [UserRole::Member]]);

        $this->actingAs($member)->delete("/admin/users/{$user->id}/two-factor")->assertForbidden();
        $this->assertNotNull($user->fresh()->two_factor_secret);
    }
}
