<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Dedoc\Scramble\Attributes\Group;

#[Group(name: 'Banner API')]
class BannerController extends Controller
{
    /**
     * Display a listing of banners (Admin view).
     */
    public function index(Request $request)
    {
        $query = Banner::with('creator:id,name')->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter by audience
        if ($request->has('audience') && $request->audience !== 'all') {
            $query->where('target_audience', $request->audience);
        }

        $banners = $query->paginate(20);

        return Inertia::render('admin/banners/index', [
            'banners' => $banners,
            'filters' => $request->only(['status', 'audience']),
        ]);
    }

    /**
     * Show the form for creating a new banner.
     */
    public function create()
    {
        return Inertia::render('admin/banners/create');
    }

    /**
     * Store a newly created banner.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,warning,success,error',
            'target_audience' => 'required|in:members,students,parents,all',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'display_duration_seconds' => 'required|integer|min:1|max:300',
            'is_active' => 'boolean',
            'is_dismissible' => 'boolean',
            'show_on_login' => 'boolean',
            'show_on_dashboard' => 'boolean',
            'send_as_push_notification' => 'boolean',
            'action_url' => 'nullable|url|max:255',
            'action_text' => 'nullable|string|max:100',
        ]);

        $validated['created_by'] = Auth::id();

        Banner::create($validated);

        return redirect()->route('banners.index')
            ->with('success', 'Banner created successfully!');
    }

    /**
     * Show the form for editing a banner.
     */
    public function edit(Banner $banner)
    {
        $banner->load('creator:id,name');

        return Inertia::render('admin/banners/edit', [
            'banner' => $banner,
        ]);
    }

    /**
     * Update the specified banner.
     */
    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,warning,success,error',
            'target_audience' => 'required|in:members,students,parents,all',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'display_duration_seconds' => 'required|integer|min:1|max:300',
            'is_active' => 'boolean',
            'is_dismissible' => 'boolean',
            'show_on_login' => 'boolean',
            'show_on_dashboard' => 'boolean',
            'send_as_push_notification' => 'boolean',
            'action_url' => 'nullable|url|max:255',
            'action_text' => 'nullable|string|max:100',
        ]);

        $banner->update($validated);

        return redirect()->route('banners.index')
            ->with('success', 'Banner updated successfully!');
    }

    /**
     * Remove the specified banner.
     */
    public function destroy(Banner $banner)
    {
        $banner->delete();

        return redirect()->route('banners.index')
            ->with('success', 'Banner deleted successfully!');
    }

    /**
     * Toggle banner active status.
     */
    public function toggleActive(Banner $banner)
    {
        $banner->update(['is_active' => !$banner->is_active]);

        return back()->with('success', 'Banner status updated successfully!');
    }

    /**
     * Get Active Banners for User (API)
     *
     * Returns active banners for the authenticated user based on their role and context.
     *
     * @authenticated
     */
    public function apiGetActiveBanners(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $context = $request->input('context', 'dashboard'); // login, dashboard, or all
        
        $banners = Banner::getForUser($user, $context);

        // Transform for API response
        $bannersData = $banners->map(function ($banner) {
            return [
                'id' => $banner->id,
                'title' => $banner->title,
                'message' => $banner->message,
                'type' => $banner->type,
                'display_duration_seconds' => $banner->display_duration_seconds,
                'is_dismissible' => $banner->is_dismissible,
                'action_url' => $banner->action_url,
                'action_text' => $banner->action_text,
                'start_date' => $banner->start_date->toIso8601String(),
                'end_date' => $banner->end_date?->toIso8601String(),
            ];
        });

        return response()->json([
            'banners' => $bannersData,
            'count' => $bannersData->count(),
        ]);
    }

    /**
     * Get Active Banners for WordPress (Public API)
     *
     * Returns active banners for public consumption (WordPress plugin).
     * Requires API key authentication.
     */
    public function apiPublicBanners(Request $request)
    {

        // Get target audience from request (default to 'all')
        $targetAudience = $request->input('audience', 'all');

        // Get active banners
        $banners = Banner::active()
            ->forAudience($targetAudience)
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($banner) {
                return [
                    'id' => $banner->id,
                    'title' => $banner->title,
                    'message' => $banner->message,
                    'type' => $banner->type,
                    'display_duration_seconds' => $banner->display_duration_seconds,
                    'is_dismissible' => $banner->is_dismissible,
                    'action_url' => $banner->action_url,
                    'action_text' => $banner->action_text,
                    'start_date' => $banner->start_date->toIso8601String(),
                    'end_date' => $banner->end_date?->toIso8601String(),
                ];
            });

        return response()->json([
            'banners' => $banners,
            'count' => $banners->count(),
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Mark Banner as Viewed (API)
     *
     * Records that a user has viewed a specific banner.
     *
     * @authenticated
     */
    public function apiMarkAsViewed(Request $request, Banner $banner)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $banner->markAsViewedBy($user);

        return response()->json([
            'message' => 'Banner marked as viewed.',
            'success' => true,
        ]);
    }

    /**
     * Mark Banner as Dismissed (API)
     *
     * Records that a user has dismissed a specific banner.
     *
     * @authenticated
     */
    public function apiMarkAsDismissed(Request $request, Banner $banner)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $banner->markAsDismissedBy($user);

        return response()->json([
            'message' => 'Banner dismissed.',
            'success' => true,
        ]);
    }

    /**
     * Mark Banner as Clicked (API)
     *
     * Records that a user has clicked on a banner's action button.
     *
     * @authenticated
     */
    public function apiMarkAsClicked(Request $request, Banner $banner)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $banner->markAsClickedBy($user);

        return response()->json([
            'message' => 'Banner click recorded.',
            'success' => true,
        ]);
    }

    /**
     * Get Banner Statistics (API)
     *
     * Returns statistics for a specific banner. Admin only.
     *
     * @authenticated
     */
    public function apiGetStatistics(Request $request, Banner $banner)
    {
        $user = $request->user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Insufficient permissions.',
            ], 403);
        }

        $stats = [
            'banner_id' => $banner->id,
            'title' => $banner->title,
            'view_count' => $banner->view_count,
            'click_count' => $banner->click_count,
            'dismiss_count' => $banner->dismiss_count,
            'click_through_rate' => $banner->view_count > 0
                ? round(($banner->click_count / $banner->view_count) * 100, 2)
                : 0,
            'dismiss_rate' => $banner->view_count > 0
                ? round(($banner->dismiss_count / $banner->view_count) * 100, 2)
                : 0,
            'is_active' => $banner->is_active,
            'start_date' => $banner->start_date->toIso8601String(),
            'end_date' => $banner->end_date?->toIso8601String(),
        ];

        return response()->json($stats);
    }

    /**
     * Get Push Notification Banners (API)
     *
     * Returns banners that should be sent as push notifications.
     * This endpoint can be called by a scheduled task or job processor.
     *
     * @authenticated
     */
    public function apiGetPushNotificationBanners(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Insufficient permissions.',
            ], 403);
        }

        // Get banners that should be sent as push notifications but haven't been sent yet
        $banners = Banner::active()
            ->where('send_as_push_notification', true)
            ->whereNull('push_notification_sent_at')
            ->where('start_date', '<=', now())
            ->get()
            ->map(function ($banner) {
                return [
                    'id' => $banner->id,
                    'title' => $banner->title,
                    'message' => $banner->message,
                    'type' => $banner->type,
                    'target_audience' => $banner->target_audience,
                    'action_url' => $banner->action_url,
                    'push_notification_data' => $banner->push_notification_data,
                ];
            });

        return response()->json([
            'banners' => $banners,
            'count' => $banners->count(),
        ]);
    }

    /**
     * Mark Push Notification as Sent (API)
     *
     * Updates a banner to indicate its push notification has been sent.
     *
     * @authenticated
     */
    public function apiMarkPushNotificationSent(Request $request, Banner $banner)
    {
        $user = $request->user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Insufficient permissions.',
            ], 403);
        }

        $banner->update([
            'push_notification_sent_at' => now(),
        ]);

        return response()->json([
            'message' => 'Push notification marked as sent.',
            'success' => true,
            'sent_at' => $banner->push_notification_sent_at->toIso8601String(),
        ]);
    }
}
