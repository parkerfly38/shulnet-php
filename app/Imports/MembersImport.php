<?php

namespace App\Imports;

use App\Models\Member;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class MembersImport implements SkipsOnError, SkipsOnFailure, ToModel, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading
{
    use SkipsErrors, SkipsFailures;

    protected $imported = 0;

    protected $updated = 0;

    protected $errors = [];

    public function model(array $row)
    {
        // Check if member exists by email (only if email is provided)
        $member = null;
        if (!empty($row['email'])) {
            $member = Member::where('email', $row['email'])->first();
        }

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
            'member_type' => $row['member_type'] ?? 'member',
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
            'email' => 'nullable|email',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'member_type' => 'nullable|in:member,contact,prospect,former',
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

    public function batchSize(): int
    {
        return 100;
    }

    public function chunkSize(): int
    {
        return 100;
    }
}
