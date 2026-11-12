<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display and edit settings.
     */
    public function index()
    {
        // Alphabetical within each group, except the synagogue name leads General.
        $settings = Setting::orderBy('group')->orderBy('key')->get()
            ->sortBy(fn (Setting $s) => [$s->group, $s->key === 'site_name' ? 0 : 1, $s->key])
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
