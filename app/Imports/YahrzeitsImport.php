<?php

namespace App\Imports;

use App\Models\Member;
use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class YahrzeitsImport implements SkipsOnError, SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsErrors, SkipsFailures;

    protected $imported = 0;

    protected $updated = 0;

    protected $errors = [];

    protected $hebrewCalendar;

    public function __construct(HebrewCalendarService $hebrewCalendar)
    {
        $this->hebrewCalendar = $hebrewCalendar;
    }

    public function model(array $row)
    {
        DB::beginTransaction();
        try {
            // Check if yahrzeit exists by name and date_of_death
            $yahrzeit = Yahrzeit::where('name', $row['name'])
                ->where('date_of_death', $row['date_of_death'])
                ->first();

            // Convert Gregorian date to Hebrew calendar
            $hebrewDate = $this->hebrewCalendar->gregorianToHebrew($row['date_of_death']);

            if ($yahrzeit) {
                // Update existing yahrzeit
                $yahrzeit->update([
                    'hebrew_name' => $row['hebrew_name'] ?? $yahrzeit->hebrew_name,
                    'observance_type' => $row['observance_type'] ?? $yahrzeit->observance_type,
                    'notes' => $row['notes'] ?? $yahrzeit->notes,
                ]);
                $this->updated++;
            } else {
                // Create new yahrzeit
                $yahrzeit = Yahrzeit::create([
                    'name' => $row['name'],
                    'hebrew_name' => $row['hebrew_name'] ?? null,
                    'date_of_death' => $row['date_of_death'],
                    'hebrew_day_of_death' => $hebrewDate['day'],
                    'hebrew_month_of_death' => $hebrewDate['month'],
                    'observance_type' => $row['observance_type'] ?? 'standard',
                    'notes' => $row['notes'] ?? null,
                ]);
                $this->imported++;
            }

            // Handle member association if provided
            if (! empty($row['member_email']) && ! empty($row['relationship'])) {
                $member = Member::where('email', $row['member_email'])->first();
                if ($member) {
                    // Check if relationship already exists
                    $exists = DB::table('member_yahrzeit')
                        ->where('member_id', $member->id)
                        ->where('yahrzeit_id', $yahrzeit->id)
                        ->exists();

                    if (! $exists) {
                        $yahrzeit->members()->attach($member->id, [
                            'relationship' => $row['relationship'],
                        ]);
                    }
                }
            }

            DB::commit();

            return null;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->errors[] = [
                'row' => $row,
                'error' => $e->getMessage(),
            ];

            return null;
        }
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'hebrew_name' => 'nullable|string|max:255',
            'date_of_death' => 'required|date',
            'observance_type' => 'nullable|in:standard,kaddish,memorial_candle,other',
            'notes' => 'nullable|string|max:1000',
            'member_email' => 'nullable|email',
            'relationship' => 'nullable|string|max:100',
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

        return array_merge($errors, $this->errors);
    }
}
