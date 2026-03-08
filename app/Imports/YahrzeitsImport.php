<?php

namespace App\Imports;

use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class YahrzeitsImport implements SkipsOnError, SkipsOnFailure, ToModel, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading
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
        // Ensure at least one type of date is provided
        $hasGregorianDate = ! empty($row['date_of_death']);
        $hasHebrewDate = ! empty($row['hebrew_day_of_death']) && ! empty($row['hebrew_month_of_death']);
        
        if (!$hasGregorianDate && !$hasHebrewDate) {
            $this->errors[] = [
                'row' => $row,
                'error' => 'Either date_of_death or hebrew_day_of_death/hebrew_month_of_death is required',
            ];
            return null;
        }

        // Determine the Gregorian date and Hebrew dates
        $gregorianDate = null;
        $hebrewDay = ! empty($row['hebrew_day_of_death']) ? $row['hebrew_day_of_death'] : null;
        
        // Get Hebrew year first as we may need it for month conversion
        $hebrewYear = ! empty($row['hebrew_year_of_death']) ? $row['hebrew_year_of_death'] : null;
        
        // Convert month name to number if text is provided
        $hebrewMonth = null;
        if (! empty($row['hebrew_month_of_death'])) {
            if (is_numeric($row['hebrew_month_of_death'])) {
                $hebrewMonth = (int) $row['hebrew_month_of_death'];
            } else {
                // Try to convert month name to number, passing year for leap year handling
                $hebrewMonth = $this->hebrewCalendar->getMonthNumberFromName(
                    $row['hebrew_month_of_death'],
                    $hebrewYear
                );
                if ($hebrewMonth === null) {
                    $this->errors[] = [
                        'row' => $row,
                        'error' => "Invalid Hebrew month name: {$row['hebrew_month_of_death']}. Valid names include: Tishrei/Tishri, Cheshvan/Heshvan/Marcheshvan, Kislev, Tevet, Shevat, Adar/Adar I/Adar II, Nisan, Iyar, Sivan, Tammuz, Av, Elul",
                    ];
                    return null;
                }
            }
        }

        if (! empty($row['date_of_death'])) {
            // Gregorian date provided
            $gregorianDate = $row['date_of_death'];
            
            // If Hebrew date not provided, calculate from Gregorian date
            if (empty($hebrewDay) || empty($hebrewMonth)) {
                $hebrewDate = $this->hebrewCalendar->gregorianToHebrew($gregorianDate);
                $hebrewDay = $hebrewDate['day'];
                $hebrewMonth = $hebrewDate['month'];
                if (empty($hebrewYear)) {
                    $hebrewYear = $hebrewDate['year'];
                }
            }
        } elseif ($hebrewDay && $hebrewMonth) {
            // Only Hebrew date provided
            // If Hebrew year is provided, try to convert to Gregorian
            if ($hebrewYear) {
                $gregorianFormatted = $this->hebrewCalendar->hebrewToGregorian($hebrewDay, $hebrewMonth, $hebrewYear);
                
                if ($gregorianFormatted) {
                    // Convert "March 7, 2026" to "2026-03-07"
                    $dateObj = \DateTime::createFromFormat('F j, Y', $gregorianFormatted);
                    $gregorianDate = $dateObj ? $dateObj->format('Y-m-d') : null;
                }
            }
            // If no year provided or conversion failed, we'll store with null Gregorian date
        }

        // Check if yahrzeit exists by name and either date
        $query = Yahrzeit::where('name', $row['name']);
        if ($gregorianDate) {
            $query->where('date_of_death', $gregorianDate);
        } else {
            // Match by Hebrew date if no Gregorian date
            $query->where('hebrew_day_of_death', $hebrewDay)
                  ->where('hebrew_month_of_death', $hebrewMonth);
        }
        $yahrzeit = $query->first();

        if ($yahrzeit) {
            // Update existing yahrzeit
            $yahrzeit->update([
                'hebrew_name' => $row['hebrew_name'] ?? $yahrzeit->hebrew_name,
                'date_of_death' => $gregorianDate ?? $yahrzeit->date_of_death,
                'hebrew_day_of_death' => $hebrewDay ?? $yahrzeit->hebrew_day_of_death,
                'hebrew_month_of_death' => $hebrewMonth ?? $yahrzeit->hebrew_month_of_death,
                'hebrew_year_of_death' => $hebrewYear ?? $yahrzeit->hebrew_year_of_death,
                'observance_type' => $row['observance_type'] ?? $yahrzeit->observance_type,
                'notes' => $row['notes'] ?? $yahrzeit->notes,
            ]);
            $this->updated++;

            return null;
        }

        // Create new yahrzeit
        $this->imported++;

        return new Yahrzeit([
            'name' => $row['name'],
            'hebrew_name' => $row['hebrew_name'] ?? null,
            'date_of_death' => $gregorianDate,
            'hebrew_day_of_death' => $hebrewDay,
            'hebrew_month_of_death' => $hebrewMonth,
            'hebrew_year_of_death' => $hebrewYear,
            'observance_type' => $row['observance_type'] ?? 'standard',
            'notes' => $row['notes'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'hebrew_name' => 'nullable|string|max:255',
            'date_of_death' => 'nullable|date',
            'hebrew_day_of_death' => 'nullable|integer|min:1|max:30',
            'hebrew_month_of_death' => 'nullable', // Can be integer (1-12) or string (month name)
            'hebrew_year_of_death' => 'nullable|integer|min:3000|max:7000',
            'observance_type' => 'nullable|in:standard,kaddish,memorial_candle,other',
            'notes' => 'nullable|string|max:1000',
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

    public function batchSize(): int
    {
        return 100;
    }

    public function chunkSize(): int
    {
        return 100;
    }
}
