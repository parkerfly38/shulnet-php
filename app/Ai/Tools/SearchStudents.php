<?php

namespace App\Ai\Tools;

use App\Actions\Students\ListStudents;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class SearchStudents extends AdminTool
{
    public function __construct(protected ListStudents $listStudents) {}

    public function description(): Stringable|string
    {
        return 'Search religious school students by first name, last name or email. Returns ids to use with student_detail.';
    }

    protected function execute(Request $request): array
    {
        $results = $this->listStudents->handle($request['search'] ?? null, $this->limit($request));

        return [
            'total' => $results->total(),
            'students' => $results->getCollection()->map(fn ($s) => [
                'id' => $s->id,
                'name' => trim("{$s->first_name} {$s->last_name}"),
                'hebrew_name' => $s->hebrew_name,
                'dob' => $s->dob ?? $s->date_of_birth,
                'parents' => $s->parents->map(fn ($p) => trim("{$p->first_name} {$p->last_name}"))->values(),
            ])->values(),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->description('First name, last name or email to search for.'),
            'limit' => $schema->integer()->description('Max results (default 10, max 25).'),
        ];
    }
}
