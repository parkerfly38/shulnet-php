<?php

namespace App\Ai\Tools;

use App\Actions\Members\GetMemberContribution;
use App\Models\Invoice;
use App\Models\Member;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Tools\Request;
use Stringable;

class MemberDetail extends AdminTool
{
    public function __construct(protected GetMemberContribution $contribution) {}

    public function description(): Stringable|string
    {
        return 'Get the full picture for one member by id: contact details, family relationships, '
            .'membership periods, board and committee roles, unpaid balance and giving totals. '
            .'Use search_members first if you only have a name.';
    }

    protected function execute(Request $request): array
    {
        $member = Member::find($request['member_id'] ?? null);

        if (! $member) {
            return ['error' => 'Member not found.'];
        }

        $member->load([
            'relatedMembers:members.id,first_name,last_name',
            'relatedBy:members.id,first_name,last_name',
            'membershipPeriods' => fn ($q) => $q->with('membershipTier:id,name')->orderByDesc('begin_date')->limit(5),
            'committees:committees.id,name',
            'boards:boards.id,name',
        ]);

        $unpaid = Invoice::where('member_id', $member->id)->whereIn('status', ['open', 'overdue', 'partial']);

        return [
            'id' => $member->id,
            'member_type' => $member->member_type,
            'name' => trim("{$member->title} {$member->first_name} {$member->last_name}"),
            'hebrew_name' => $member->hebrew_name,
            'email' => $member->email,
            'phone' => $member->phone1,
            'address' => collect([$member->address_line_1, $member->city, $member->state, $member->zip])->filter()->implode(', '),
            'dob' => $member->dob?->toDateString(),
            'deceased' => $member->deceased,
            'last_renewal' => $member->last_renewal?->toDateString(),
            'has_active_membership' => $member->hasActiveMembership(),
            'family' => $member->relatedMembers->map(fn ($m) => [
                'id' => $m->id, 'name' => trim("{$m->first_name} {$m->last_name}"), 'relationship' => $m->pivot->relationship_type,
            ])->merge($member->relatedBy->map(fn ($m) => [
                'id' => $m->id, 'name' => trim("{$m->first_name} {$m->last_name}"), 'relationship' => 'related by '.$m->pivot->relationship_type,
            ]))->values(),
            'membership_periods' => $member->membershipPeriods->map(fn ($p) => [
                'tier' => $p->membershipTier?->name,
                'type' => $p->membership_type,
                'begin' => $p->begin_date?->toDateString(),
                'end' => $p->end_date?->toDateString(),
            ])->values(),
            'boards' => $member->boards->map(fn ($b) => [
                'name' => $b->name, 'title' => $b->pivot->title, 'start' => $b->pivot->term_start_date, 'end' => $b->pivot->term_end_date,
            ])->values(),
            'committees' => $member->committees->map(fn ($c) => [
                'name' => $c->name, 'title' => $c->pivot->title, 'start' => $c->pivot->term_start_date, 'end' => $c->pivot->term_end_date,
            ])->values(),
            'unpaid_invoice_count' => (clone $unpaid)->count(),
            'unpaid_balance' => round((float) (clone $unpaid)->selectRaw('COALESCE(SUM(total - amount_paid), 0) as due')->value('due'), 2),
            'contribution' => $this->contribution->handle($member),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'member_id' => $schema->integer()->required()->description('The member id.'),
        ];
    }
}
