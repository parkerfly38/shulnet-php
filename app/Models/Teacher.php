<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    protected $fillable = [
        'last_name',
        'first_name',
        'middle_name',
        'title',
        'address',
        'qualifications',
        'start_date',
        'end_date',
        'position_title',
        'emploee_code',
        'email',
        'phone',
        'picture_url',
    ];

    public function classDefinitions(): HasMany
    {
        return $this->hasMany(ClassDefinition::class, 'teacher_id');
    }
}
