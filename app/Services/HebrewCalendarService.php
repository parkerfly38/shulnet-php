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
                'day' => (int)$day,
                'month' => $this->getHebrewMonthNumberApproximate((int)$month),
                'year' => (int)$year + 3760, // Approximate Hebrew year
                'formatted' => null
            ];
        }

        // Parse the Hebrew date (format: "month/day/year")
        $parts = explode('/', $hebrewDate);
        
        if (count($parts) !== 3) {
            // Fallback parsing
            return [
                'day' => (int)$day,
                'month' => $this->getHebrewMonthNumberApproximate((int)$month),
                'year' => (int)$year + 3760,
                'formatted' => null
            ];
        }

        $hebrewMonth = (int)$parts[0];
        $hebrewDay = (int)$parts[1];
        $hebrewYear = (int)$parts[2];

        return [
            'day' => $hebrewDay,
            'month' => $hebrewMonth,
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
     * Approximate Hebrew month number based on Gregorian month (fallback)
     */
    private function getHebrewMonthNumberApproximate(int $gregorianMonth): int
    {
        // Very rough approximation - Hebrew year starts in fall
        $approximateMapping = [
            1 => 4,   // January -> Tevet
            2 => 5,   // February -> Shevat
            3 => 6,   // March -> Adar
            4 => 7,   // April -> Nisan
            5 => 8,   // May -> Iyar
            6 => 9,   // June -> Sivan
            7 => 10,  // July -> Tammuz
            8 => 11,  // August -> Av
            9 => 12,  // September -> Elul
            10 => 1,  // October -> Tishrei
            11 => 2,  // November -> Cheshvan
            12 => 3   // December -> Kislev
        ];

        return $approximateMapping[$gregorianMonth] ?? 1;
    }

    /**
     * Get all Hebrew month names for select options
     */
    public function getHebrewMonths(): array
    {
        return self::HEBREW_MONTHS;
    }

    /**
     * Get current Hebrew date
     *
     * @return array Current Hebrew calendar date
     */
    public function getCurrentHebrewDate(): array
    {
        return $this->gregorianToHebrew(date('Y-m-d'));
    }
}