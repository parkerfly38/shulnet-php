<?php

namespace App\Actions\Students;

use App\Models\Student;
use Illuminate\Pagination\LengthAwarePaginator;

class ListStudents
{
    public function handle(?string $search = null, int $perPage = 25): LengthAwarePaginator
    {
        $query = Student::with('parents');

        if ($search) {
            $query->where(function ($s) use ($search) {
                $s->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }
}
