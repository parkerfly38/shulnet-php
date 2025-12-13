<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Member extends Model
{
    /** @use HasFactory<\Database\Factories\MemberFactory> */
    use HasFactory;

    protected $fillable = [
        'lastrenewal',
        'lastaction',
        'lastlogin',
        'email',
        'phone1',
        'phone2',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'zip',
        'country',
        'dob',
        'first_name',
        'last_name',
        'middle_name',
        'title',
        'gender',
        'aliyah',
        'bnaimitzvahdate',
        'chazanut',
        'tribe',
        'dvartorah',
        'deceased',
        'father_hebrew_name',
        'mother_hebrew_name',
        'hebrew_name',
        'briabatorah',
        'maftir',
        'anniversary_date'
    ];

    /**
     * Get the yahrzeits associated with this member.
     */
    public function yahrzeits(): BelongsToMany
    {
        return $this->belongsToMany(Yahrzeit::class, 'member_yahrzeit')
                    ->withPivot('relationship')
                    ->withTimestamps();
    }
}