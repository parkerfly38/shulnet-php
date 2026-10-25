<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class HasRolesEdgeCasesTest extends TestCase
{
    use RefreshDatabase;

    public function test_duplicate_roles_are_stored_once(): void
    {
        $user = User::factory()->create(['roles' => ['admin', 'admin', UserRole::Admin]]);

        $this->assertCount(1, $user->fresh()->roles);
    }

    public function test_null_and_empty_roles_mean_no_roles(): void
    {
        $user = User::factory()->create(['roles' => []]);

        $this->assertSame([], $user->fresh()->roles);
        $this->assertFalse($user->hasRole('admin'));
        $this->assertFalse($user->hasAnyRole(['admin', 'member']));
        $this->assertSame('No roles assigned', $user->role_labels);
    }

    public function test_has_role_accepts_strings_and_enums_and_unknown_roles_are_false(): void
    {
        $user = User::factory()->create(['roles' => ['teacher']]);

        $this->assertTrue($user->hasRole('teacher'));
        $this->assertTrue($user->hasRole(UserRole::Teacher));
        $this->assertFalse($user->hasRole('not-a-role'));
    }

    public function test_has_all_roles_requires_every_role(): void
    {
        $user = User::factory()->create(['roles' => ['admin', 'teacher']]);

        $this->assertTrue($user->hasAllRoles(['admin', 'teacher']));
        $this->assertFalse($user->hasAllRoles(['admin', 'parent']));
        $this->assertTrue($user->hasAllRoles([]));
    }

    public function test_adding_an_existing_role_is_a_no_op_and_removing_the_last_role_clears_roles(): void
    {
        $user = User::factory()->create(['roles' => ['member']]);

        $user->addRole('member');
        $this->assertCount(1, $user->fresh()->roles);

        $user->removeRole('admin');
        $this->assertCount(1, $user->fresh()->roles);

        $user->removeRole(UserRole::Member);
        $this->assertSame([], $user->fresh()->roles);
        $this->assertNull($user->fresh()->getRawOriginal('roles'));
    }

    public function test_set_roles_replaces_existing_roles_and_accepts_enums(): void
    {
        $user = User::factory()->create(['roles' => ['admin']]);

        $user->setRoles([UserRole::Parent, 'student', 'student']);
        $this->assertTrue($user->fresh()->isParent());
        $this->assertTrue($user->fresh()->isStudent());
        $this->assertFalse($user->fresh()->isAdmin());

        $user->setRoles([]);
        $this->assertSame([], $user->fresh()->roles);
    }

    public function test_each_role_helper_matches_only_its_role(): void
    {
        foreach (['admin' => 'isAdmin', 'teacher' => 'isTeacher', 'parent' => 'isParent', 'student' => 'isStudent', 'member' => 'isMember'] as $role => $method) {
            $user = User::factory()->create(['roles' => [$role]]);

            foreach (['isAdmin', 'isTeacher', 'isParent', 'isStudent', 'isMember'] as $check) {
                $this->assertSame($check === $method, $user->$check(), "{$role} -> {$check}");
            }
        }
    }

    public function test_scopes_filter_users_by_role(): void
    {
        $admin = User::factory()->create(['roles' => ['admin']]);
        $teacher = User::factory()->create(['roles' => ['teacher']]);
        $both = User::factory()->create(['roles' => ['admin', 'teacher']]);
        User::factory()->create(['roles' => ['member']]);

        $this->assertEqualsCanonicalizing([$admin->id, $both->id], User::withRole('admin')->pluck('id')->all());
        $this->assertEqualsCanonicalizing(
            [$admin->id, $teacher->id, $both->id],
            User::withAnyRole([UserRole::Admin, 'teacher'])->pluck('id')->all()
        );
    }

    public function test_role_middleware_allows_any_listed_role_and_rejects_others(): void
    {
        Route::middleware(['web', 'auth', 'role:admin,teacher'])->get('/_role-probe', fn () => 'ok');

        $this->actingAs(User::factory()->create(['roles' => ['teacher']]))->get('/_role-probe')->assertOk();
        $this->actingAs(User::factory()->create(['roles' => ['member']]))->get('/_role-probe')->assertForbidden();
    }
}
