<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in(array_keys(config('app.supported_locales')))],
        ]);

        $request->user()?->update(['locale' => $validated['locale']]);

        return back()->withCookie(cookie()->forever(SetLocale::COOKIE, $validated['locale']));
    }
}
