<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneAiConversations extends Command
{
    protected $signature = 'ai:prune-conversations {--days=30 : Delete conversations not updated within this many days}';

    protected $description = 'Delete AI assistant conversations (and their messages) that have been inactive for N days';

    public function handle(): int
    {
        $conversations = config('ai.conversations.tables.conversations', 'agent_conversations');
        $messages = config('ai.conversations.tables.messages', 'agent_conversation_messages');
        $cutoff = now()->subDays((int) $this->option('days'));

        $ids = DB::table($conversations)->where('updated_at', '<', $cutoff)->pluck('id');

        foreach ($ids->chunk(500) as $chunk) {
            DB::table($messages)->whereIn('conversation_id', $chunk)->delete();
            DB::table($conversations)->whereIn('id', $chunk)->delete();
        }

        $this->info("Pruned {$ids->count()} conversation(s).");

        return self::SUCCESS;
    }
}
