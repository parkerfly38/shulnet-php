<?php

/**
 * Example usage of the User Roles System
 * 
 * This file demonstrates how to use the combinable roles system
 * that has been added to your Laravel application.
 */

use App\Enums\UserRole;
use App\Models\User;

// Creating users with roles
// ------------------------

// Create a user with a single role
$admin = User::factory()->create([
    'name' => 'John Admin',
    'email' => 'john@example.com',
    'roles' => [UserRole::Admin]
]);

// Create a user with multiple roles
$teacherParent = User::factory()->create([
    'name' => 'Jane Teacher-Parent',
    'email' => 'jane@example.com',
    'roles' => [UserRole::Teacher, UserRole::Parent]
]);

// Managing roles
// --------------

// Add a role to an existing user
$user = User::find(1);
$user->addRole(UserRole::Student);

// Remove a role from a user
$user->removeRole(UserRole::Student);

// Set roles (replaces all existing roles)
$user->setRoles([UserRole::Teacher, UserRole::Admin]);

// Checking roles
// --------------

// Check if user has a specific role
if ($user->hasRole(UserRole::Admin)) {
    echo "User is an admin!";
}

// Check if user has any of the specified roles
if ($user->hasAnyRole([UserRole::Teacher, UserRole::Admin])) {
    echo "User is either a teacher or admin!";
}

// Check if user has all of the specified roles
if ($user->hasAllRoles([UserRole::Teacher, UserRole::Parent])) {
    echo "User is both a teacher and parent!";
}

// Convenience methods
if ($user->isAdmin()) {
    echo "User is an admin!";
}

if ($user->isTeacher()) {
    echo "User is a teacher!";
}

// Get role labels
echo $user->role_labels; // "Administrator, Teacher"

// Database queries
// ----------------

// Find all admins
$admins = User::withRole(UserRole::Admin)->get();

// Find all teachers and parents
$teachersAndParents = User::withAnyRole([UserRole::Teacher, UserRole::Parent])->get();

// Find users with no roles
$usersWithoutRoles = User::whereNull('roles')->get();

// Using factory states
// -------------------

// Create test users with specific roles
$admin = User::factory()->admin()->create();
$teacher = User::factory()->teacher()->create();
$parent = User::factory()->parent()->create();
$student = User::factory()->student()->create();

// Create user with multiple roles
$multiRoleUser = User::factory()
    ->withRoles([UserRole::Teacher, UserRole::Parent, UserRole::Admin])
    ->create();

// Available roles
// ---------------
/*
UserRole::Admin     - Administrator
UserRole::Member    - Member  
UserRole::Teacher   - Teacher
UserRole::Parent    - Parent
UserRole::Student   - Student
*/

// Get all available roles
$allRoles = UserRole::cases();
$roleValues = UserRole::values(); // ['admin', 'member', 'teacher', 'parent', 'student']
$roleOptions = UserRole::options(); // ['admin' => 'Administrator', 'member' => 'Member', ...]