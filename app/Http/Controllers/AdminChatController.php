<?php

namespace App\Http\Controllers;

use App\Ai\Agents\AdminAssistant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminChatController extends Controller
{
    /**
     * Send a message to the admin AI assistant and return its reply.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'conversation_id' => ['nullable', 'string'],
        ]);

        $response = (new AdminAssistant)
            ->continueOrStart($data['conversation_id'] ?? null, $request->user())
            ->prompt($data['message']);

        return response()->json([
            'reply' => (string) $response,
            'conversation_id' => $response->conversationId,
        ]);
    }
}
