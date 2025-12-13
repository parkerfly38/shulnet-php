# User Roles System

This Laravel application now includes a comprehensive and combinable user roles system that allows users to have multiple roles simultaneously.

## Available Roles

The system includes the following roles:

- **Admin** (`admin`) - Administrator with full access
- **Member** (`member`) - Basic member access
- **Teacher** (`teacher`) - Teaching privileges
- **Parent** (`parent`) - Parent/guardian access
- **Student** (`student`) - Student access

## Features

- **Combinable Roles**: Users can have multiple roles (e.g., a user can be both a Teacher and a Parent)
- **Type-Safe**: Uses PHP enums for type safety
- **Database Efficient**: Stores roles as JSON in a single column
- **Query Scopes**: Built-in query scopes for filtering users by roles
- **Convenience Methods**: Easy-to-use methods for checking and managing roles
- **Factory States**: Pre-built factory states for testing
- **Middleware**: Role-based access control middleware

## Basic Usage

### Creating Users with Roles

```php
use App\Enums\UserRole;
use App\Models\User;

// Create user with single role
$admin = User::factory()->create([
    'roles' => [UserRole::Admin]
]);

// Create user with multiple roles
$teacherParent = User::factory()->create([
    'roles' => [UserRole::Teacher, UserRole::Parent]
]);

// Using factory states
$admin = User::factory()->admin()->create();
$teacher = User::factory()->teacher()->create();
$multiRole = User::factory()->withRoles([UserRole::Teacher, UserRole::Parent])->create();
```

### Managing Roles

```php
$user = User::find(1);

// Add a role
$user->addRole(UserRole::Teacher);

// Remove a role
$user->removeRole(UserRole::Student);

// Set roles (replaces all existing)
$user->setRoles([UserRole::Admin, UserRole::Teacher]);
```

### Checking Roles

```php
// Check for specific role
if ($user->hasRole(UserRole::Admin)) {
    // User is admin
}

// Check for any of multiple roles
if ($user->hasAnyRole([UserRole::Teacher, UserRole::Admin])) {
    // User is either teacher or admin
}

// Check for all roles
if ($user->hasAllRoles([UserRole::Teacher, UserRole::Parent])) {
    // User has both teacher and parent roles
}

// Convenience methods
if ($user->isAdmin()) { /* ... */ }
if ($user->isTeacher()) { /* ... */ }
if ($user->isParent()) { /* ... */ }
if ($user->isStudent()) { /* ... */ }
if ($user->isMember()) { /* ... */ }
```

### Database Queries

```php
// Find all admins
$admins = User::withRole(UserRole::Admin)->get();

// Find users with any of the specified roles
$teachersAndParents = User::withAnyRole([UserRole::Teacher, UserRole::Parent])->get();

// Find users without roles
$usersWithoutRoles = User::whereNull('roles')->get();
```

### Getting Role Information

```php
// Get role labels as string
echo $user->role_labels; // "Administrator, Teacher"

// Get all available roles
$allRoles = UserRole::cases();
$roleValues = UserRole::values(); // ['admin', 'member', 'teacher', 'parent', 'student']
$roleOptions = UserRole::options(); // ['admin' => 'Administrator', ...]
```

## Middleware

The system includes two middleware classes for protecting routes:

### RoleMiddleware (Requires ANY of the specified roles)

```php
// In your routes
Route::get('/admin', [AdminController::class, 'index'])
    ->middleware(['auth', 'role:admin']);

Route::get('/teaching', [TeachingController::class, 'index'])
    ->middleware(['auth', 'role:teacher,admin']); // Teacher OR Admin
```

### RequireAllRolesMiddleware (Requires ALL specified roles)

```php
Route::get('/teacher-parent-portal', [PortalController::class, 'index'])
    ->middleware(['auth', 'require-all-roles:teacher,parent']); // Teacher AND Parent
```

Don't forget to register these middleware in your `bootstrap/app.php` or wherever you configure middleware:

```php
// Add to your middleware aliases
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
        'require-all-roles' => \App\Http\Middleware\RequireAllRolesMiddleware::class,
    ]);
})
```

## API Controller

A `RoleController` is included with endpoints for:

- `GET /api/users/roles` - List all users with their roles
- `PUT /api/users/{user}/roles` - Update user roles
- `POST /api/users/{user}/roles/add` - Add a role to user
- `DELETE /api/users/{user}/roles/remove` - Remove a role from user
- `GET /api/users/by-role` - Get users by specific role
- `GET /api/user/admin-check` - Check current user's admin access

## Testing

The system includes comprehensive tests in `tests/Feature/UserRolesTest.php`. Run them with:

```bash
php artisan test --filter UserRolesTest
```

## Database Schema

The system adds a `roles` JSON column to the `users` table:

```php
// Migration automatically created
Schema::table('users', function (Blueprint $table) {
    $table->json('roles')->nullable()->after('email');
});
```

## Seeder

Run the included seeder to create sample users with different roles:

```bash
php artisan db:seed --class=RolesSeeder
```

## Example Use Cases

1. **School Management System**: A teacher who is also a parent can access both teaching tools and parent portals
2. **Multi-tenant Application**: Users can be admins of one organization and members of another
3. **Learning Management System**: Someone can be both a teacher and a student in different contexts
4. **Community Platform**: Users can have member access and also serve as moderators (admin)

## Migration Commands

To set up the roles system:

```bash
# Run the migration
php artisan migrate

# Seed sample data
php artisan db:seed --class=RolesSeeder

# Run tests
php artisan test --filter UserRolesTest
```

## Files Created/Modified

- `app/Enums/UserRole.php` - Role enum definition
- `app/Traits/HasRoles.php` - Role management trait
- `app/Models/User.php` - Updated to use HasRoles trait
- `app/Http/Controllers/RoleController.php` - API controller for role management
- `app/Http/Middleware/RoleMiddleware.php` - Role-based access middleware
- `app/Http/Middleware/RequireAllRolesMiddleware.php` - Middleware requiring all roles
- `database/migrations/*_add_roles_to_users_table.php` - Database migration
- `database/factories/UserFactory.php` - Updated with role factory states
- `database/seeders/RolesSeeder.php` - Sample data seeder
- `tests/Feature/UserRolesTest.php` - Comprehensive tests
- `example-roles-usage.php` - Usage examples

This system provides a flexible, type-safe, and efficient way to manage user roles in your Laravel application.