<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_user_management_page(): void
    {
        $admin = User::factory()->create([
            'roles' => [UserRole::Admin]
        ]);

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_access_user_management_page(): void
    {
        $user = User::factory()->create([
            'roles' => [UserRole::Member]
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
            'roles' => ['teacher', 'parent']
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
}