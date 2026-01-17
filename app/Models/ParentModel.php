<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
    ];

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'parent_id');
    }

    public function member(): HasOne
    {
        return $this->hasOne(Member::class, 'parent_id');
    }
}
