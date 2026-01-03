<?php

namespace App\Imports;

use App\Models\Member;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Illuminate\Support\Facades\Log;

class MembersImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError, SkipsOnFailure
{
    use SkipsErrors, SkipsFailures;

    protected $imported = 0;
    protected $updated = 0;
    protected $errors = [];

    public function model(array $row)
    {
        // Check if member exists by email
        $member = Member::where('email', $row['email'])->first();

        if ($member) {
            // Update existing member
            $member->update([
                'title' => $row['title'] ?? $member->title,
                'first_name' => $row['first_name'] ?? $member->first_name,
                'last_name' => $row['last_name'] ?? $member->last_name,
                'email' => $row['email'],
                'phone1' => $row['phone1'] ?? $member->phone1,
                'phone2' => $row['phone2'] ?? null,
                'member_type' => $row['member_type'] ?? $member->member_type,
                'address_line_1' => $row['address_line_1'] ?? null,
                'address_line_2' => $row['address_line_2'] ?? null,
                'city' => $row['city'] ?? null,
                'state' => $row['state'] ?? null,
                'zip' => $row['zip'] ?? null,
                'country' => $row['country'] ?? null,
                'dob' => $row['dob'] ?? $member->dob,
                'gender' => $row['gender'] ?? null,
            ]);
            $this->updated++;
            return null;
        }

        // Create new member
        $this->imported++;
        return new Member([
            'title' => $row['title'] ?? null,
            'first_name' => $row['first_name'],
            'last_name' => $row['last_name'],
            'email' => $row['email'],
            'phone1' => $row['phone1'] ?? null,
            'phone2' => $row['phone2'] ?? null,
            'member_type' => $row['member_type'] ?? 'individual',
            'address_line_1' => $row['address_line_1'] ?? null,
            'address_line_2' => $row['address_line_2'] ?? null,
            'city' => $row['city'] ?? null,
            'state' => $row['state'] ?? null,
            'zip' => $row['zip'] ?? null,
            'country' => $row['country'] ?? null,
            'dob' => $row['dob'] ?? null,
            'gender' => $row['gender'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'member_type' => 'nullable|in:individual,family',
        ];
    }

    public function getImported(): int
    {
        return $this->imported;
    }

    public function getUpdated(): int
    {
        return $this->updated;
    }

    public function getErrors(): array
    {
        $errors = [];
        foreach ($this->failures() as $failure) {
            $errors[] = [
                'row' => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors' => $failure->errors(),
            ];
        }
        return $errors;
    }
}
