<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleSwitchingTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_with_multiple_roles_can_switch_roles()
    {
        // Create a user with both admin and member roles
        $user = User::factory()->create([
            'roles' => [UserRole::Admin, UserRole::Member],
        ]);
        
        // Create a member profile for this user
        $member = Member::factory()->create([
            'user_id' => $user->id,
        ]);

        // Login as the user
        $this->actingAs($user);

        // Initially, user should have admin as active role (highest priority)
        $this->assertEquals('admin', $user->getActiveRole()->value);

        // Switch to member role
        $response = $this->post(route('role.switch'), [
            'role' => 'member',
        ]);

        // Should redirect to member dashboard
        $response->assertRedirect(route('member.dashboard'));

        // Active role should now be member
        $this->assertEquals('member', session('active_role'));
        
        // Refresh user instance and check active role
        $user = $user->fresh();
        $this->assertEquals('member', $user->getActiveRole()->value);
    }

    public function test_user_cannot_switch_to_role_they_dont_have()
    {
        // Create a user with only member role
        $user = User::factory()->create([
            'roles' => [UserRole::Member],
        ]);

        $this->actingAs($user);

        // Try to switch to admin role (which they don't have)
        $response = $this->post(route('role.switch'), [
            'role' => 'admin',
        ]);

        // Should get forbidden response
        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'You do not have permission to switch to this role.',
        ]);
    }

    public function test_user_with_single_role_has_role_switching_disabled()
    {
        // Create a user with only admin role
        $user = User::factory()->create([
            'roles' => [UserRole::Admin],
        ]);

        $this->actingAs($user);

        // Check that role switching is disabled
        $this->assertFalse($user->hasMultipleRoles());

        // Get available roles endpoint
        $response = $this->get(route('role.available'));
        
        $response->assertJson([
            'roles' => [[
                'value' => 'admin',
                'label' => 'Admin',
            ]],
            'active_role' => 'admin',
        ]);
    }

    public function test_available_roles_endpoint_returns_correct_data()
    {
        // Create a user with multiple roles
        $user = User::factory()->create([
            'roles' => [UserRole::Admin, UserRole::Member, UserRole::Teacher],
        ]);

        $this->actingAs($user);

        $response = $this->get(route('role.available'));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'roles' => [
                '*' => ['value', 'label'],
            ],
            'active_role',
        ]);

        $responseData = $response->json();
        $this->assertCount(3, $responseData['roles']);
        $this->assertEquals('admin', $responseData['active_role']);
    }

    public function test_default_role_priority_order()
    {
        // Create users with different role combinations
        $adminMemberUser = User::factory()->create([
            'roles' => [UserRole::Member, UserRole::Admin], // Order shouldn't matter
        ]);
        
        $memberTeacherUser = User::factory()->create([
            'roles' => [UserRole::Teacher, UserRole::Member],
        ]);

        // Admin should be highest priority
        $this->assertEquals('admin', $adminMemberUser->getActiveRole()->value);
        
        // Member should have higher priority than teacher
        $this->assertEquals('member', $memberTeacherUser->getActiveRole()->value);
    }

    public function test_dashboard_controller_respects_active_role()
    {
        // Create user with both roles
        $user = User::factory()->create([
            'roles' => [UserRole::Admin, UserRole::Member],
        ]);
        
        $member = Member::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->actingAs($user);

        // Default should go to admin dashboard
        $response = $this->get(route('dashboard'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('admin/dashboard'));

        // Switch to member role
        $this->post(route('role.switch'), ['role' => 'member']);

        // Now should redirect to member dashboard
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('member.dashboard'));
    }
}
