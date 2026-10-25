<?php

namespace App\Ai\Tools;

use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

abstract class AdminTool implements Tool
{
    abstract protected function execute(Request $request): array;

    public function handle(Request $request): Stringable|string
    {
        if (! auth()->user()?->hasRole('admin')) {
            return json_encode(['error' => 'You are not authorized to use this tool.']);
        }

        return json_encode($this->execute($request));
    }

    protected function limit(Request $request): int
    {
        return min(max((int) ($request['limit'] ?? 10), 1), 25);
    }
}
