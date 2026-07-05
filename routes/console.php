<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('banners:send-push-notifications')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('membership:generate-dues')
    ->daily()
    ->at('01:00')
    ->withoutOverlapping()
    ->runInBackground();
