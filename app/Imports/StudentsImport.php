<?php

namespace App\Imports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentsImport implements SkipsOnError, SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsErrors, SkipsFailures;

    protected $imported = 0;

    protected $updated = 0;

    protected $errors = [];
    
    protected $pendingParentSyncs = [];

    public function model(array $row)
    {
        // Check if student exists by email (if email is provided)
        $student = null;
        if (! empty($row['email'])) {
            $student = Student::where('email', $row['email'])->first();
        }

        // If no student found by email, try matching by name and date of birth
        if (! $student && ! empty($row['first_name']) && ! empty($row['last_name'])) {
            $query = Student::where('first_name', $row['first_name'])
                ->where('last_name', $row['last_name']);

            if (! empty($row['date_of_birth']) || ! empty($row['dob'])) {
                $dob = $row['date_of_birth'] ?? $row['dob'];
                $query->where(function ($q) use ($dob) {
                    $q->where('date_of_birth', $dob)
                        ->orWhere('dob', $dob);
                });
            }

            $student = $query->first();
        }

        if ($student) {
            // Update existing student
            $student->update([
                'first_name' => $row['first_name'] ?? $student->first_name,
                'last_name' => $row['last_name'] ?? $student->last_name,
                'middle_name' => $row['middle_name'] ?? $student->middle_name,
                'email' => $row['email'] ?? $student->email,
                'gender' => $row['gender'] ?? $student->gender,
                'date_of_birth' => $row['date_of_birth'] ?? $student->date_of_birth,
                'dob' => $row['dob'] ?? $student->dob,
                'address' => $row['address'] ?? $student->address,
                'picture_url' => $row['picture_url'] ?? $student->picture_url,
                'is_parent_email' => isset($row['is_parent_email']) ? (bool) $row['is_parent_email'] : $student->is_parent_email,
            ]);
            
            // Sync parent relationship if parent_id is provided
            if (!empty($row['parent_id'])) {
                $student->parents()->sync([$row['parent_id']]);
            }
            
            $this->updated++;

            return null;
        }

        // Create new student
        $this->imported++;

        $newStudent = Student::create([
            'first_name' => $row['first_name'],
            'last_name' => $row['last_name'],
            'middle_name' => $row['middle_name'] ?? null,
            'email' => $row['email'] ?? null,
            'gender' => $row['gender'] ?? null,
            'date_of_birth' => $row['date_of_birth'] ?? null,
            'dob' => $row['dob'] ?? null,
            'address' => $row['address'] ?? null,
            'picture_url' => $row['picture_url'] ?? null,
            'is_parent_email' => isset($row['is_parent_email']) ? (bool) $row['is_parent_email'] : false,
        ]);
        
        // Sync parent relationship if parent_id is provided
        if (!empty($row['parent_id'])) {
            $newStudent->parents()->sync([$row['parent_id']]);
        }
        
        return null;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'dob' => 'nullable|date',
            'parent_id' => 'nullable|integer|exists:parents,id',
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
