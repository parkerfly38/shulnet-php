<?php

namespace App\Http\Controllers;

use App\Ai\Agents\AdminAssistant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Ai\Contracts\ConversationStore;
use Laravel\Ai\Models\Conversation;

class AdminChatController extends Controller
{
    /**
     * Return the current user's most recent conversation so the widget can restore it.
     */
    public function show(Request $request, ConversationStore $store): JsonResponse
    {
        $user = $request->user();
        $type = Conversation::participantType($user);
        $key = Conversation::participantKey($user);

        $conversationId = $store->latestConversationId($type, $key, AdminAssistant::class);

        $updatedAt = $conversationId
            ? DB::table(config('ai.conversations.tables.conversations', 'agent_conversations'))->where('id', $conversationId)->value('updated_at')
            : null;

        if (! $conversationId || ! $updatedAt || now()->subDays(30)->gt($updatedAt)) {
            return response()->json(['conversation_id' => null, 'messages' => []]);
        }

        $messages = DB::table(config('ai.conversations.tables.messages', 'agent_conversation_messages'))
            ->where('conversation_id', $conversationId)
            ->where('participant_type', $type)
            ->where('participant_id', $key)
            ->whereIn('role', ['user', 'assistant'])
            ->orderBy('created_at')
            ->orderBy('id')
            ->limit(100)
            ->get(['role', 'content'])
            ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])
            ->filter(fn ($m) => $m['content'] !== '')
            ->values();

        return response()->json(['conversation_id' => $conversationId, 'messages' => $messages]);
    }

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
