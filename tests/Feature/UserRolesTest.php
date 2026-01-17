<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRolesTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_have_single_role(): void
    {
        $user = User::factory()->create([
            'roles' => [UserRole::Admin],
        ]);

        $this->assertTrue($user->hasRole(UserRole::Admin));
        $this->assertTrue($user->isAdmin());
        $this->assertFalse($user->hasRole(UserRole::Teacher));
    }

    public function test_user_can_have_multiple_roles(): void
    {
        $user = User::factory()->create([
            'roles' => [UserRole::Teacher, UserRole::Parent],
        ]);

        $this->assertTrue($user->hasRole(UserRole::Teacher));
        $this->assertTrue($user->hasRole(UserRole::Parent));
        $this->assertTrue($user->isTeacher());
        $this->assertTrue($user->isParent());
        $this->assertFalse($user->hasRole(UserRole::Admin));
    }

    public function test_user_role_checking_methods(): void
    {
        $user = User::factory()->create([
            'roles' => [UserRole::Teacher, UserRole::Admin],
        ]);

        $this->assertTrue($user->hasAnyRole([UserRole::Student, UserRole::Teacher]));
        $this->assertTrue($user->hasAllRoles([UserRole::Teacher, UserRole::Admin]));
        $this->assertFalse($user->hasAllRoles([UserRole::Teacher, UserRole::Student]));
    }

    public function test_user_can_add_role(): void
    {
        $user = User::factory()->create([
            'roles' => [UserRole::Student],
        ]);

        $user->addRole(UserRole::Parent);

        $this->assertTrue($user->hasRole(UserRole::Student));
        $this->assertTrue($user->hasRole(UserRole::Parent));
    }

    public function test_user_can_remove_role(): void
    {
        $user = User::factory()->create([
            'roles' => [UserRole::Teacher, UserRole::Parent],
        ]);

        $user->removeRole(UserRole::Teacher);

        $this->assertFalse($user->hasRole(UserRole::Teacher));
        $this->assertTrue($user->hasRole(UserRole::Parent));
    }

    public function test_user_can_set_roles(): void
    {
        $user = User::factory()->create([
            'roles' => [UserRole::Student],
        ]);

        $user->setRoles([UserRole::Admin, UserRole::Teacher]);

        $this->assertFalse($user->hasRole(UserRole::Student));
        $this->assertTrue($user->hasRole(UserRole::Admin));
        $this->assertTrue($user->hasRole(UserRole::Teacher));
    }

    public function test_role_labels_accessor(): void
    {
        $user = User::factory()->create([
            'roles' => [UserRole::Admin, UserRole::Teacher],
        ]);

        $this->assertStringContainsString('Administrator', $user->role_labels);
        $this->assertStringContainsString('Teacher', $user->role_labels);
    }

    public function test_user_with_role_scope(): void
    {
        User::factory()->create(['roles' => [UserRole::Admin]]);
        User::factory()->create(['roles' => [UserRole::Teacher]]);
        User::factory()->create(['roles' => [UserRole::Student]]);

        $admins = User::withRole(UserRole::Admin)->get();
        $this->assertCount(1, $admins);
    }

    public function test_user_with_any_role_scope(): void
    {
        User::factory()->create(['roles' => [UserRole::Admin]]);
        User::factory()->create(['roles' => [UserRole::Teacher]]);
        User::factory()->create(['roles' => [UserRole::Student]]);

        $teachersAndAdmins = User::withAnyRole([UserRole::Teacher, UserRole::Admin])->get();
        $this->assertCount(2, $teachersAndAdmins);
    }

    public function test_user_factory_states(): void
    {
        $admin = User::factory()->admin()->create();
        $teacher = User::factory()->teacher()->create();
        $parent = User::factory()->parent()->create();
        $student = User::factory()->student()->create();

        $this->assertTrue($admin->isAdmin());
        $this->assertTrue($teacher->isTeacher());
        $this->assertTrue($parent->isParent());
        $this->assertTrue($student->isStudent());
    }

    public function test_user_enum_methods(): void
    {
        $roles = UserRole::values();
        $this->assertContains('admin', $roles);
        $this->assertContains('teacher', $roles);
        $this->assertContains('parent', $roles);
        $this->assertContains('student', $roles);
        $this->assertContains('member', $roles);

        $options = UserRole::options();
        $this->assertEquals('Administrator', $options['admin']);
        $this->assertEquals('Teacher', $options['teacher']);
    }
}
