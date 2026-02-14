<?php

namespace App\Providers;

use App\Models\Event;
use App\Models\Meeting;
use App\Observers\EventObserver;
use App\Observers\MeetingObserver;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers
        Event::observe(EventObserver::class);
        Meeting::observe(MeetingObserver::class);

        // Configure Scramble API documentation
        Scramble::extendOpenApi(function (OpenApi $openApi) {
            $openApi->secure(
                SecurityScheme::http('bearer', 'sanctum')
            );
        });
    }
}
