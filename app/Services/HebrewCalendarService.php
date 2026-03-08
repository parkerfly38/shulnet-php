<?php

namespace App\Services;

class HebrewCalendarService
{
    /**
     * Hebrew month names (regular year)
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
        12 => 'Elul',
    ];

    /**
     * Hebrew month names (leap year)
     */
    private const HEBREW_MONTHS_LEAP = [
        1 => 'Tishrei',
        2 => 'Cheshvan',
        3 => 'Kislev',
        4 => 'Tevet',
        5 => 'Shevat',
        6 => 'Adar I',
        7 => 'Adar II',
        8 => 'Nisan',
        9 => 'Iyar',
        10 => 'Sivan',
        11 => 'Tammuz',
        12 => 'Av',
        13 => 'Elul',
    ];

    /**
     * Convert Gregorian date to Hebrew calendar
     *
     * @param  string  $gregorianDate  Date in Y-m-d format
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
                'day' => (int) $day,
                'month' => $this->getHebrewMonthNumberApproximate((int) $month),
                'year' => (int) $year + 3760, // Approximate Hebrew year
                'formatted' => null,
            ];
        }

        // Parse the Hebrew date (format: "month/day/year")
        $parts = explode('/', $hebrewDate);

        if (count($parts) !== 3) {
            // Fallback parsing
            return [
                'day' => (int) $day,
                'month' => $this->getHebrewMonthNumberApproximate((int) $month),
                'year' => (int) $year + 3760,
                'formatted' => null,
            ];
        }

        $hebrewMonth = (int) $parts[0];
        $hebrewDay = (int) $parts[1];
        $hebrewYear = (int) $parts[2];

        return [
            'day' => $hebrewDay,
            'month' => $hebrewMonth,
            'year' => $hebrewYear,
            'formatted' => sprintf('%d %s %d', $hebrewDay, $this->getHebrewMonthName($hebrewMonth), $hebrewYear),
        ];
    }

    /**
     * Get Hebrew month name by number
     */
    private function getHebrewMonthName(int $monthNumber): string
    {
        // For months 1-12, use regular year names
        // For month 13 (only in leap years), use leap year array
        if ($monthNumber >= 1 && $monthNumber <= 12) {
            return self::HEBREW_MONTHS[$monthNumber] ?? 'Unknown';
        }
        
        // Month 13 only exists in leap years (Elul)
        return self::HEBREW_MONTHS_LEAP[$monthNumber] ?? 'Unknown';
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
            12 => 3,   // December -> Kislev
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
     * Convert Hebrew month name to number (case-insensitive)
     *
     * @param string $monthName Hebrew month name (e.g., "Tishrei", "Nisan", "Adar I", "Adar II")
     * @return int|null Month number (1-13) or null if not found
     */
    /**
     * Check if a Hebrew year is a leap year (has 13 months)
     */
    public function isHebrewLeapYear(int $year): bool
    {
        // A Hebrew leap year has an Adar II (month 7)
        // Try to create a valid date in Adar II - if it works, it's a leap year
        $jd = jewishtojd(7, 1, $year);
        
        // Convert back and check if we still have month 7
        $parts = explode('/', jdtojewish($jd));
        return isset($parts[0]) && (int)$parts[0] === 7;
    }

    /**
     * Convert a Hebrew month name to its number
     * Optionally provide a year to handle leap year numbering correctly
     */
    public function getMonthNumberFromName(string $monthName, ?int $hebrewYear = null): ?int
    {
        $monthName = trim($monthName);
        $normalizedName = strtolower($monthName);

        // Check for Adar II variations
        $adarIIVariations = [
            'adar 2', 'adar ii', 'adar sheni', 'adar bet', 'adar beth', 'adar b',
            've-adar', 'veadar'
        ];
        
        if (in_array($normalizedName, $adarIIVariations)) {
            // If a Hebrew year is provided and it's a leap year, return 7
            if ($hebrewYear !== null && $this->isHebrewLeapYear($hebrewYear)) {
                return 7; // Adar II in leap year
            }
            // If no year provided or not a leap year, treat as Adar (month 6)
            // The observance logic will correctly place it on Adar II in future leap years
            return 6;
        }

        // Check common spelling variations
        // Use regular year numbering (1-12) as baseline
        $variations = [
            // Tishrei variations (month 1)
            'tishrei' => 1,
            'tishri' => 1,
            
            // Cheshvan variations (month 2)
            'cheshvan' => 2,
            'heshvan' => 2,
            'cheshwan' => 2,
            'heshwan' => 2,
            'marcheshvan' => 2,
            'marheshvan' => 2,
            
            // Kislev variations (month 3)
            'kislev' => 3,
            'chislev' => 3,
            'kislew' => 3,
            
            // Tevet variations (month 4)
            'tevet' => 4,
            'teves' => 4,
            'tebet' => 4,
            
            // Shevat variations (month 5)
            'shevat' => 5,
            'shvat' => 5,
            'shebat' => 5,
            'sebat' => 5,
            
            // Adar variations (month 6 in both regular and leap years)
            // In regular year: just Adar
            // In leap year: Adar I
            'adar' => 6,
            'adar 1' => 6,
            'adar i' => 6,
            'adar rishon' => 6,
            'adar aleph' => 6,
            'adar a' => 6,
            
            // Nisan variations (month 7 in regular year, 8 in leap year)
            'nisan' => 7,
            'nissan' => 7,
            
            // Iyar variations (month 8 in regular year, 9 in leap year)
            'iyar' => 8,
            'iyyar' => 8,
            
            // Sivan variations (month 9 in regular year, 10 in leap year)
            'sivan' => 9,
            'siwan' => 9,
            
            // Tammuz variations (month 10 in regular year, 11 in leap year)
            'tammuz' => 10,
            'tamuz' => 10,
            'thammuz' => 10,
            
            // Av variations (month 11 in regular year, 12 in leap year)
            'av' => 11,
            'ab' => 11,
            'ov' => 11,
            
            // Elul variations (month 12 in regular year, 13 in leap year)
            'elul' => 12,
            'ellul' => 12,
        ];

        $monthNumber = $variations[$normalizedName] ?? null;
        
        if ($monthNumber === null) {
            return null;
        }

        // If Hebrew year is provided and it's a leap year, adjust month numbers
        // Months from Nisan through Elul (7-12) need to be incremented by 1 to become 8-13
        if ($hebrewYear !== null && $this->isHebrewLeapYear($hebrewYear)) {
            if ($monthNumber >= 7 && $monthNumber <= 12) {
                $monthNumber++;
            }
        }

        return $monthNumber;
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

    /**
     * Convert Hebrew date to Gregorian date for a specific Hebrew year
     *
     * @return string|null Gregorian date in 'F j, Y' format or null if conversion fails
     */
    public function hebrewToGregorian(int $hebrewDay, int $hebrewMonth, int $hebrewYear): ?string
    {
        try {
            // Convert Hebrew date to Julian Day Number
            $julianDay = jewishtojd($hebrewMonth, $hebrewDay, $hebrewYear);

            if ($julianDay === 0) {
                return null;
            }

            // Convert Julian Day to Gregorian
            $gregorianDate = jdtogregorian($julianDay);

            if (empty($gregorianDate)) {
                return null;
            }

            // Parse the Gregorian date (format: "month/day/year")
            $parts = explode('/', $gregorianDate);

            if (count($parts) !== 3) {
                return null;
            }

            $month = (int) $parts[0];
            $day = (int) $parts[1];
            $year = (int) $parts[2];

            // Format as readable date
            $dateObj = \DateTime::createFromFormat('m/d/Y', sprintf('%02d/%02d/%04d', $month, $day, $year));

            return $dateObj ? $dateObj->format('F j, Y') : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get Gregorian date for a Hebrew date in the current Hebrew year
     *
     * @return string|null Gregorian date in 'F j, Y' format
     */
    public function getGregorianDateForCurrentYear(int $hebrewDay, int $hebrewMonth): ?string
    {
        $currentHebrewYear = $this->getCurrentHebrewDate()['year'];

        return $this->hebrewToGregorian($hebrewDay, $hebrewMonth, $currentHebrewYear);
    }

    /**
     * Calculate the next observance date for a yahrzeit
     * Returns the next occurrence (this year or next year) in Y-m-d format
     * Handles leap year Adar complexities
     *
     * @param int $hebrewDay Hebrew day (1-30)
     * @param int $hebrewMonth Hebrew month (1-13)
     * @return string|null Next observance date in Y-m-d format
     */
    public function getNextYahrzeitDate(int $hebrewDay, int $hebrewMonth): ?string
    {
        $currentHebrewYear = $this->getCurrentHebrewDate()['year'];
        $today = new \DateTime('today');
        
        // Try current Hebrew year
        $dateThisYear = $this->calculateYahrzeitForYear($hebrewDay, $hebrewMonth, $currentHebrewYear);
        
        if ($dateThisYear) {
            $dateObj = \DateTime::createFromFormat('Y-m-d', $dateThisYear);
            // If the date hasn't passed yet this year, use it
            if ($dateObj && $dateObj >= $today) {
                return $dateThisYear;
            }
        }
        
        // Otherwise, get next year's date
        return $this->calculateYahrzeitForYear($hebrewDay, $hebrewMonth, $currentHebrewYear + 1);
    }

    /**
     * Calculate the previous observance date for a yahrzeit
     * Returns the most recent past occurrence in Y-m-d format
     * Handles leap year Adar complexities
     *
     * @param int $hebrewDay Hebrew day (1-30)
     * @param int $hebrewMonth Hebrew month (1-13)
     * @return string|null Previous observance date in Y-m-d format
     */
    public function getPreviousYahrzeitDate(int $hebrewDay, int $hebrewMonth): ?string
    {
        $currentHebrewYear = $this->getCurrentHebrewDate()['year'];
        $today = new \DateTime('today');
        
        // Try current Hebrew year
        $dateThisYear = $this->calculateYahrzeitForYear($hebrewDay, $hebrewMonth, $currentHebrewYear);
        
        if ($dateThisYear) {
            $dateObj = \DateTime::createFromFormat('Y-m-d', $dateThisYear);
            // If the date has already passed this year, use it
            if ($dateObj && $dateObj < $today) {
                return $dateThisYear;
            }
        }
        
        // Otherwise, get last year's date
        return $this->calculateYahrzeitForYear($hebrewDay, $hebrewMonth, $currentHebrewYear - 1);
    }

    /**
     * Calculate yahrzeit observance for a specific Hebrew year
     * Handles month adjustments between leap and non-leap years
     *
     * @param int $hebrewDay Original Hebrew day of death
     * @param int $hebrewMonth Original Hebrew month (stored in regular year numbering 1-12)
     * @param int $targetYear Hebrew year to calculate observance for
     * @return string|null Gregorian date in Y-m-d format
     */
    private function calculateYahrzeitForYear(int $hebrewDay, int $hebrewMonth, int $targetYear): ?string
    {
        $isTargetLeapYear = $this->isHebrewLeapYear($targetYear);
        $observanceMonth = $hebrewMonth;
        
        // Adjust month numbering based on leap year status
        if ($hebrewMonth === 6) {
            // Adar (month 6)
            // Regular year: observe on Adar (month 6)
            // Leap year: observe on Adar II (month 7) - traditional practice
            $observanceMonth = $isTargetLeapYear ? 7 : 6;
        } elseif ($hebrewMonth >= 7 && $hebrewMonth <= 12) {
            // Months Nisan through Elul (7-12 in regular year)
            // In leap years, these shift to months 8-13 due to Adar II insertion
            $observanceMonth = $isTargetLeapYear ? $hebrewMonth + 1 : $hebrewMonth;
        }
        // Months 1-5 (Tishrei through Shevat) never need adjustment
        
        return $this->hebrewToGregorianFormatted($hebrewDay, $observanceMonth, $targetYear);
    }

    /**
     * Convert Hebrew date to Gregorian in Y-m-d format
     *
     * @return string|null Gregorian date in 'Y-m-d' format or null if conversion fails
     */
    private function hebrewToGregorianFormatted(int $hebrewDay, int $hebrewMonth, int $hebrewYear): ?string
    {
        try {
            // Convert Hebrew date to Julian Day Number
            $julianDay = jewishtojd($hebrewMonth, $hebrewDay, $hebrewYear);

            if ($julianDay === 0) {
                return null;
            }

            // Convert Julian Day to Gregorian
            $gregorianDate = jdtogregorian($julianDay);

            if (empty($gregorianDate)) {
                return null;
            }

            // Parse the Gregorian date (format: "month/day/year")
            $parts = explode('/', $gregorianDate);

            if (count($parts) !== 3) {
                return null;
            }

            $month = (int) $parts[0];
            $day = (int) $parts[1];
            $year = (int) $parts[2];

            // Format as Y-m-d
            return sprintf('%04d-%02d-%02d', $year, $month, $day);
        } catch (\Exception $e) {
            return null;
        }
    }
}

