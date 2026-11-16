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

    /**
     * The member record invoices for this parent are billed to. Invoices, their PDFs, emails and
     * payments all read the name and address from a member, so a parent who isn't a member gets
     * a "contact" member record linked through members.parent_id.
     */
    public function billingMember(): Member
    {
        if ($this->member) {
            return $this->member;
        }

        $lines = array_values(array_filter(array_map('trim', preg_split('/\R/', (string) $this->address))));

        $member = Member::create([
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone1' => $this->phone,
            'dob' => $this->date_of_birth,
            'address_line_1' => $lines[0] ?? null,
            'address_line_2' => count($lines) > 1 ? implode(', ', array_slice($lines, 1)) : null,
            'member_type' => 'contact',
            'parent_id' => $this->id,
        ]);

        $this->setRelation('member', $member);

        return $member;
    }
}
