<?php

namespace App\Providers;

use App\Models\Event;
use App\Models\Meeting;
use App\Observers\EventObserver;
use App\Observers\MeetingObserver;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use App\Services\SettingsService;
use Illuminate\Notifications\Events\NotificationSending;
use Illuminate\Support\Facades\Event as EventFacade;
use Illuminate\Support\Facades\URL;
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

        // Laravel's built-in emails (password reset, etc.) sign off with config('app.name');
        // use the synagogue name from Settings instead. Runs per send, so queue workers see edits.
        $appName = config('app.name');
        EventFacade::listen(function (NotificationSending $event) use ($appName) {
            if ($event->channel === 'mail') {
                config(['app.name' => $appName]); // so a cleared setting falls back to APP_NAME, not a previous value
                config(['app.name' => app(SettingsService::class)->organizationName()]);
            }
        });

        // Configure Scramble API documentation
        Scramble::extendOpenApi(function (OpenApi $openApi) {
            $openApi->secure(
                SecurityScheme::http('bearer', 'sanctum')
            );
        });
    }
}
