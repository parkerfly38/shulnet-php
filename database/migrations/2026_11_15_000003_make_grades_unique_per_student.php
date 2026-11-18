<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The gradebook keeps one grade per student per class, subject and exam (a class grade row is also how a
 * student is enrolled in a class). The old one-row-at-a-time screens allowed duplicates, so keep the most
 * recently updated row of each and then enforce it.
 */
return new class extends Migration
{
    private const TABLES = [
        'class_grades' => 'class_definition_id',
        'subject_grades' => 'subject_id',
        'exam_grades' => 'exam_id',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table => $column) {
            $seen = [];

            foreach (DB::table($table)->orderByDesc('updated_at')->orderByDesc('id')->get(['id', $column, 'student_id']) as $row) {
                $key = $row->{$column}.'|'.$row->student_id;

                if (isset($seen[$key])) {
                    DB::table($table)->where('id', $row->id)->delete();
                } else {
                    $seen[$key] = true;
                }
            }

            Schema::table($table, function (Blueprint $t) use ($table, $column) {
                $t->unique([$column, 'student_id'], "{$table}_per_student_unique");
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table => $column) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->dropUnique("{$table}_per_student_unique");
            });
        }
    }
};
