<?php

namespace App\Ai\Tools;

use App\Actions\Members\ListMembers;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class SearchMembers extends AdminTool
{
    public function __construct(protected ListMembers $listMembers) {}

    public function description(): Stringable|string
    {
        return 'Search synagogue members and contacts by name, email, city or state, optionally filtered by member type.';
    }

    protected function execute(Request $request): array
    {
        $results = $this->listMembers->handle(
            $request['search'] ?? null,
            $request['member_type'] ?? null,
            (bool) ($request['primary_only'] ?? false),
            $this->limit($request),
        );

        return [
            'total' => $results->total(),
            'members' => $results->getCollection()->map(fn ($m) => [
                'id' => $m->id,
                'member_type' => $m->member_type,
                'name' => trim("{$m->first_name} {$m->last_name}"),
                'email' => $m->email,
                'phone' => $m->phone1,
                'city' => $m->city,
                'state' => $m->state,
            ])->values(),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->description('Name, email, city or state to search for.'),
            'member_type' => $schema->string()->enum(['member', 'contact', 'prospect', 'former'])
                ->description('Restrict to one member type.'),
            'primary_only' => $schema->boolean()->description('Only primary accounts (exclude children of another member).'),
            'limit' => $schema->integer()->description('Max results (default 10, max 25).'),
        ];
    }
}
