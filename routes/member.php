<?php

use App\Http\Controllers\Member\MemberDashboardController;
use App\Http\Controllers\Member\PaymentController;
use App\Http\Controllers\Member\CommitteeController as MemberCommitteeController;
use App\Http\Controllers\Member\BoardController as MemberBoardController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

// All routes in this file require authentication and verification
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Member Portal
    Route::prefix('member')->group(function () {
        Route::get('dashboard', [MemberDashboardController::class, 'index'])->name('member.dashboard');
        Route::get('invoices', [MemberDashboardController::class, 'invoices'])->name('member.invoices');
        Route::get('invoices/{id}', [MemberDashboardController::class, 'showInvoice'])->name('member.invoices.show');
        Route::get('profile', [MemberDashboardController::class, 'profile'])->name('member.profile');
        Route::put('profile', [MemberDashboardController::class, 'updateProfile'])->name('member.profile.update');
        Route::get('students', [MemberDashboardController::class, 'students'])->name('member.students');
        Route::put('students/{student}', [MemberDashboardController::class, 'updateStudent'])->name('member.students.update');
        Route::get('yahrzeits', [MemberDashboardController::class, 'yahrzeits'])->name('member.yahrzeits');
        Route::post('yahrzeits/request-change', [MemberDashboardController::class, 'requestYahrzeitChange'])->name('member.yahrzeits.request-change');
        Route::get('events', [MemberDashboardController::class, 'events'])->name('member.events');
        Route::post('events/{event}/register', [MemberDashboardController::class, 'registerForEvent'])->name('member.events.register');

        // Member Committees and Boards
        Route::get('committees', [MemberCommitteeController::class, 'index'])->name('member.committees.index');
        Route::get('committees/{committee}', [MemberCommitteeController::class, 'show'])->name('member.committees.show');
        Route::get('boards', [MemberBoardController::class, 'index'])->name('member.boards.index');
        Route::get('boards/{board}', [MemberBoardController::class, 'show'])->name('member.boards.show');

        // Payment Routes
        Route::get('invoices/{id}/pay', [PaymentController::class, 'create'])->name('member.invoices.pay');
        Route::post('invoices/{id}/pay', [PaymentController::class, 'store'])->name('member.invoices.payment.store');
        Route::get('payment/setup-intent', [PaymentController::class, 'setupIntent'])->name('member.payment.setup-intent');
    });

    // Onboarding routes
    Route::post('onboarding/member', [DashboardController::class, 'onboardMember'])->name('onboarding.member');
    Route::post('onboarding/student', [DashboardController::class, 'onboardStudent'])->name('onboarding.student');
});
