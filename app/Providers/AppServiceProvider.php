<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;use App\Models\Event;
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
        // Force HTTPS globally if running behind your production domain proxy
        if (config('app.env') !== 'local' || request()->header('X-Forwarded-Proto') === 'https') {
            URL::forceScheme('https');
        }
        
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
