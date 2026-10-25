<?php

namespace App\Actions\Members;

use App\Models\Member;
use Illuminate\Pagination\LengthAwarePaginator;

class ListMembers
{
    public function handle(
        ?string $search = null,
        ?string $memberType = null,
        bool $primaryOnly = false,
        int $perPage = 15,
    ): LengthAwarePaginator {
        $query = Member::query()
            ->select([
                'id', 'member_type', 'first_name', 'last_name', 'email', 'phone1',
                'city', 'state', 'user_id', 'created_at', 'updated_at',
            ])
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('state', 'like', "%{$search}%");
            });
        }

        if ($memberType) {
            $query->where('member_type', $memberType);
        }

        if ($primaryOnly) {
            // Exclude members who have a 'parent' relationship (they're children of another member)
            $query->whereDoesntHave('inverseRelationships', function ($q) {
                $q->where('relationship_type', 'parent');
            });
        }

        return $query->paginate($perPage);
    }
}
