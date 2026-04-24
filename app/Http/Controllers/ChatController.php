<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /**
     * Display the chat page.
     */
    public function index(): Response
    {
        return Inertia::render('chat', [
            'chatConfig' => [
                'enabled' => config('services.chat.enabled'),
                'url' => config('services.chat.url'),
                'title' => config('services.chat.title'),
            ],
        ]);
    }
}
