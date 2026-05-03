<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoleSwitchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. Routes
| are loaded by the RouteServiceProvider and all will be assigned to the
| "web" middleware group. Make something great!
|
| Route organization:
| - public.php: Public routes (no authentication required)
| - member.php: Member portal routes (authenticated members)
| - admin.php: Admin panel routes (admin role required)
| - school.php: School management UI routes (admin role required)
| - api-authenticated.php: API routes (various authentication levels)
|
*/

// Main dashboard (authenticated users)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Role switching routes
    Route::post('switch-role', [RoleSwitchController::class, 'switch'])->name('role.switch');
    Route::get('available-roles', [RoleSwitchController::class, 'availableRoles'])->name('role.available');
    
    // Chat page
    Route::get('chat', [ChatController::class, 'index'])->name('chat');
});

// Include modular route files
require __DIR__.'/public.php';
require __DIR__.'/member.php';
require __DIR__.'/admin.php';
require __DIR__.'/school.php';

// API routes
Route::prefix('api')->group(function () {
    require __DIR__.'/api-authenticated.php';
});

// Settings routes
require __DIR__.'/settings.php';
