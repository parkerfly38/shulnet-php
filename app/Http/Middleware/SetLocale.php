<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const COOKIE = 'locale';

    /**
     * Resolve the locale: user preference, then cookie, then browser header, then default.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supported = array_keys(config('app.supported_locales'));

        $locale = collect([
            $request->user()?->locale,
            $request->cookie(self::COOKIE),
            $request->getPreferredLanguage($supported),
        ])->first(fn ($candidate) => is_string($candidate) && in_array($candidate, $supported, true))
            ?? config('app.locale');

        App::setLocale($locale);

        return $next($request);
    }
}
