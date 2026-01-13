<?php

namespace App\Http\Middleware;

use App\Models\Note;
use App\Services\HebrewCalendarService;
use App\Services\SettingsService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        
        // Get unseen notifications count for current user
        $unseenNotifications = 0;
        if ($user) {
            $unseenNotifications = Note::where('user_id', $user->id)
                ->whereNull('seen_date')
                ->count();
        }

        // Get current date in both Gregorian and Hebrew calendars
        $hebrewCalendarService = app(HebrewCalendarService::class);
        $hebrewDate = $hebrewCalendarService->getCurrentHebrewDate();
        $gregorianDate = now()->format('l, F j, Y'); // e.g., "Tuesday, December 24, 2025"

        // Get system currency setting
        $settingsService = app(SettingsService::class);
        $currency = $settingsService->getCurrency();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles ? array_map(fn($role) => $role->value, $user->roles) : [],
                    'is_admin' => $user->isAdmin(),
                    'is_teacher' => $user->isTeacher(),
                    'is_parent' => $user->isParent(),
                    'is_student' => $user->isStudent(),
                    'is_member' => $user->isMember(),
                    'member' => $user->member ? [
                        'id' => $user->member->id,
                        'first_name' => $user->member->first_name,
                        'last_name' => $user->member->last_name,
                    ] : null,
                ] : null,
                'unseenNotifications' => $unseenNotifications,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currency' => $currency,
            'currentDate' => [
                'gregorian' => $gregorianDate,
                'hebrew' => $hebrewDate['formatted'],
            ],
        ];
    }
}
