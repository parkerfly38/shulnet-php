<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create an admin user
        User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        // Create a teacher user
        User::factory()->teacher()->create([
            'name' => 'Teacher User',
            'email' => 'teacher@example.com',
        ]);

        // Create a parent user
        User::factory()->parent()->create([
            'name' => 'Parent User',
            'email' => 'parent@example.com',
        ]);

        // Create a student user
        User::factory()->student()->create([
            'name' => 'Student User',
            'email' => 'student@example.com',
        ]);

        // Create a user with multiple roles (Teacher and Parent)
        User::factory()->withRoles([UserRole::Teacher, UserRole::Parent])->create([
            'name' => 'Teacher Parent User',
            'email' => 'teacher-parent@example.com',
        ]);

        // Create a member user
        User::factory()->create([
            'name' => 'Member User',
            'email' => 'member@example.com',
            'roles' => [UserRole::Member],
        ]);

        // Create some additional users with random roles
        User::factory(5)->create()->each(function ($user) {
            $roles = collect(UserRole::cases())
                ->random(rand(1, 3))
                ->toArray();
            $user->setRoles($roles);
        });
    }
}
