<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Attendance was saved with dates like "2026-11-15 00:00:00" on SQLite, which lookups by date never matched,
 * so re-saving general (no-class) attendance added duplicates. Store plain dates and keep only the most
 * recently updated record per student, day and class.
 */
return new class extends Migration
{
    public function up(): void
    {
        $rows = DB::table('attendances')
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get(['id', 'student_id', 'attendance_date', 'class_definition_id']);

        $kept = [];

        foreach ($rows as $row) {
            $date = substr((string) $row->attendance_date, 0, 10);
            $key = "{$row->student_id}|{$date}|{$row->class_definition_id}";

            if (isset($kept[$key])) {
                DB::table('attendances')->where('id', $row->id)->delete(); // an older duplicate

                continue;
            }

            $kept[$key] = true;

            if ($date !== (string) $row->attendance_date) {
                DB::table('attendances')->where('id', $row->id)->update(['attendance_date' => $date]);
            }
        }
    }

    public function down(): void
    {
        // Removed duplicates can't be restored; plain dates work with the old code too.
    }
};
