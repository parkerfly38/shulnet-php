<?php

use App\Http\Controllers\EmailCampaignController;
use App\Http\Controllers\FormController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Home page
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public campaign routes (no auth required)
Route::get('campaigns/confirm/{token}', [EmailCampaignController::class, 'confirm'])->name('campaigns.confirm');
Route::get('campaigns/{campaign}/unsubscribe/{member}', [EmailCampaignController::class, 'unsubscribePublic'])->name('campaigns.unsubscribe.public');

// Public form submission (no auth required)
Route::post('forms/{form}/submit', [FormController::class, 'submit'])->name('forms.submit');
