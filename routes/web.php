<?php

use App\Http\Controllers\MemberController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\YahrzeitController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('admin/users', [UserController::class, 'index'])->name('admin.users');
        
        // Member management routes
        Route::resource('admin/members', MemberController::class, [
            'names' => [
                'index' => 'members.index',
                'create' => 'members.create',
                'store' => 'members.store',
                'show' => 'members.show',
                'edit' => 'members.edit',
                'update' => 'members.update',
                'destroy' => 'members.destroy',
            ]
        ]);
        
        // Yahrzeit management routes
        Route::resource('admin/yahrzeits', YahrzeitController::class, [
            'names' => [
                'index' => 'yahrzeits.index',
                'create' => 'yahrzeits.create',
                'store' => 'yahrzeits.store',
                'show' => 'yahrzeits.show',
                'edit' => 'yahrzeits.edit',
                'update' => 'yahrzeits.update',
                'destroy' => 'yahrzeits.destroy',
            ]
        ]);
        
        // Calendar management routes
        Route::resource('admin/calendars', CalendarController::class, [
            'names' => [
                'index' => 'calendars.index',
                'create' => 'calendars.create',
                'store' => 'calendars.store',
                'show' => 'calendars.show',
                'edit' => 'calendars.edit',
                'update' => 'calendars.update',
                'destroy' => 'calendars.destroy',
            ]
        ]);
        
        // Event management routes
        Route::resource('admin/events', EventController::class, [
            'names' => [
                'index' => 'events.index',
                'create' => 'events.create',
                'store' => 'events.store',
                'show' => 'events.show',
                'edit' => 'events.edit',
                'update' => 'events.update',
                'destroy' => 'events.destroy',
            ]
        ]);
    });
});

// API routes for admin functionality
Route::middleware(['auth:web', 'role:admin'])->prefix('api/admin')->group(function () {
    Route::put('users/{user}/roles', [UserController::class, 'updateRoles'])->name('api.admin.users.roles.update');
    
    // Member search API endpoint
    Route::get('members/search', [MemberController::class, 'search'])->name('api.admin.members.search');
    
    // Yahrzeit search API endpoint
    Route::get('yahrzeits/search', [YahrzeitController::class, 'search'])->name('api.admin.yahrzeits.search');
});

require __DIR__.'/settings.php';
