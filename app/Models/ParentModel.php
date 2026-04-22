<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ParentModel extends Model
{
    protected $table = 'parents';

    protected $fillable = [
        'last_name',
        'first_name',
        'date_of_birth',
        'address',
        'picture_url',
        'email',
        'phone',
    ];

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'parent_student', 'parent_id', 'student_id');
    }

    public function member(): HasOne
    {
        return $this->hasOne(Member::class, 'parent_id');
    }
}
