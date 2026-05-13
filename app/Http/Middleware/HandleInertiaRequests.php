<?php

namespace App\Http\Middleware;

use App\Models\Banner;
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

        // Get active login banners (for login/register pages)
        $loginBanners = Banner::active()
            ->showOnLogin()
            ->when($user, function ($query) use ($user) {
                $query->notDismissedBy($user);
            })
            ->get()
            ->map(function ($banner) {
                return [
                    'id' => $banner->id,
                    'title' => $banner->title,
                    'message' => $banner->message,
                    'type' => $banner->type,
                    'is_dismissible' => $banner->is_dismissible,
                    'action_url' => $banner->action_url,
                    'action_text' => $banner->action_text,
                    'display_duration_seconds' => $banner->display_duration_seconds,
                ];
            })
            ->toArray();

        // Get active dashboard banners (for authenticated users)
        $dashboardBanners = [];
        if ($user) {
            // Determine the user's primary audience type
            $audience = 'members'; // default
            if ($user->isStudent()) {
                $audience = 'students';
            } elseif ($user->isParent()) {
                $audience = 'parents';
            } elseif ($user->isMember()) {
                $audience = 'members';
            }

            $dashboardBanners = Banner::active()
                ->showOnDashboard()
                ->forAudience($audience)
                ->notDismissedBy($user)
                ->get()
                ->map(function ($banner) {
                    return [
                        'id' => $banner->id,
                        'title' => $banner->title,
                        'message' => $banner->message,
                        'type' => $banner->type,
                        'is_dismissible' => $banner->is_dismissible,
                        'action_url' => $banner->action_url,
                        'action_text' => $banner->action_text,
                        'display_duration_seconds' => $banner->display_duration_seconds,
                    ];
                })
                ->toArray();
        }

        return [
            ...parent::share($request),
            'csrf_token' => csrf_token(),
            'name' => config('app.name'),
            'version' => config('app.version'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles ? array_map(fn ($role) => $role->value, $user->roles) : [],
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
            'loginBanners' => $loginBanners,
            'dashboardBanners' => $dashboardBanners,
            'roleSwitch' => $user ? $this->getRoleSwitchData($user) : null,
            'chatConfig' => [
                'enabled' => config('services.chat.enabled'),
                'url' => config('services.chat.url'),
                'mode' => config('services.chat.mode'),
                'title' => config('services.chat.title'),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'import_errors' => $request->session()->get('import_errors'),
            ],
        ];
    }

    /**
     * Get role switch data for the user
     */
    private function getRoleSwitchData($user): array
    {
        if (!$user->hasMultipleRoles()) {
            return [
                'enabled' => false,
                'roles' => [],
                'activeRole' => null,
            ];
        }

        $roles = $user->roles ?? [];
        $activeRole = $user->getActiveRole();

        return [
            'enabled' => true,
            'activeRole' => $activeRole->value,
            'roles' => array_map(fn($role) => [
                'value' => $role->value,
                'label' => ucfirst($role->value),
                'route' => $this->getRoleRoute($role),
            ], $roles),
        ];
    }

    /**
     * Get the route name for a specific role
     */
    private function getRoleRoute(\App\Enums\UserRole $role): string
    {
        return match($role) {
            \App\Enums\UserRole::Admin => 'dashboard',
            \App\Enums\UserRole::Member => 'member.dashboard',
            default => 'dashboard',
        };
    }
}
