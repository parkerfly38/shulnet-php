<?php

namespace App\Services;

class HebrewCalendarService
{
    /**
     * Hebrew month names
     */
    private const HEBREW_MONTHS = [
        1 => 'Tishrei',
        2 => 'Cheshvan',
        3 => 'Kislev',
        4 => 'Tevet',
        5 => 'Shevat',
        6 => 'Adar',
        7 => 'Nisan',
        8 => 'Iyar',
        9 => 'Sivan',
        10 => 'Tammuz',
        11 => 'Av',
        12 => 'Elul'
    ];

    /**
     * Convert Gregorian date to Hebrew calendar
     *
     * @param string $gregorianDate Date in Y-m-d format
     * @return array Hebrew calendar components
     */
    public function gregorianToHebrew(string $gregorianDate): array
    {
        // Convert to timestamp
        $timestamp = strtotime($gregorianDate);
        $year = date('Y', $timestamp);
        $month = date('m', $timestamp);
        $day = date('d', $timestamp);

        // Convert to Julian Day Number
        $julianDay = gregoriantojd($month, $day, $year);

        // Convert Julian Day to Jewish calendar
        $hebrewDate = jdtojewish($julianDay);
        
        if (empty($hebrewDate)) {
            // Fallback if conversion fails
            return [
                'day' => $day,
                'month' => $this->getHebrewMonthApproximate($month),
                'year' => $year + 3760, // Approximate Hebrew year
                'formatted' => null
            ];
        }

        // Parse the Hebrew date (format: "month/day/year")
        $parts = explode('/', $hebrewDate);
        
        if (count($parts) !== 3) {
            // Fallback parsing
            return [
                'day' => $day,
                'month' => $this->getHebrewMonthApproximate($month),
                'year' => $year + 3760,
                'formatted' => null
            ];
        }

        $hebrewMonth = (int)$parts[0];
        $hebrewDay = (int)$parts[1];
        $hebrewYear = (int)$parts[2];

        return [
            'day' => $hebrewDay,
            'month' => $this->getHebrewMonthName($hebrewMonth),
            'year' => $hebrewYear,
            'formatted' => sprintf('%d %s %d', $hebrewDay, $this->getHebrewMonthName($hebrewMonth), $hebrewYear)
        ];
    }

    /**
     * Get Hebrew month name by number
     */
    private function getHebrewMonthName(int $monthNumber): string
    {
        return self::HEBREW_MONTHS[$monthNumber] ?? 'Unknown';
    }

    /**
     * Approximate Hebrew month based on Gregorian month (fallback)
     */
    private function getHebrewMonthApproximate(int $gregorianMonth): string
    {
        // Very rough approximation - Hebrew year starts in fall
        $approximateMapping = [
            1 => 'Tevet',     // January
            2 => 'Shevat',    // February
            3 => 'Adar',      // March
            4 => 'Nisan',     // April
            5 => 'Iyar',      // May
            6 => 'Sivan',     // June
            7 => 'Tammuz',    // July
            8 => 'Av',        // August
            9 => 'Elul',      // September
            10 => 'Tishrei',  // October
            11 => 'Cheshvan', // November
            12 => 'Kislev'    // December
        ];

        return $approximateMapping[$gregorianMonth] ?? 'Unknown';
    }

    /**
     * Get all Hebrew month names for select options
     */
    public function getHebrewMonths(): array
    {
        return self::HEBREW_MONTHS;
    }
}