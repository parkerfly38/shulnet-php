<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Where settings appear within their group: the basics, then the payment processor followed by
     * each processor's credentials, grouped by processor.
     */
    private const DISPLAY_ORDER = [
        'site_name',
        'site_timezone',
        'currency',
        'payment_processor',
        'authorize_net_api_login_id',
        'authorize_net_transaction_key',
        'authorize_net_environment',
        'paypal_client_id',
        'paypal_secret',
        'paypal_mode',
        'stripe_public_key',
        'stripe_secret_key',
    ];

    /**
     * Display and edit settings.
     */
    public function index()
    {
        // Settings listed in DISPLAY_ORDER come first in that order; the rest follow alphabetically.
        // Membership billing and email have their own pages (the email page saves to email_settings;
        // nothing reads the SMTP rows in this table), so they aren't edited here.
        $position = array_flip(self::DISPLAY_ORDER);
        $settings = Setting::whereNotIn('group', ['membership', 'email'])->get()
            ->sortBy(fn (Setting $s) => [$s->group, $position[$s->key] ?? PHP_INT_MAX, $s->key])
            ->values()
            ->groupBy('group');

        return Inertia::render('settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            Setting::set($key, $value);
        }

        Setting::clearCache();

        return redirect()
            ->route('settings.index')
            ->with('success', 'Settings updated successfully.');
    }
}
