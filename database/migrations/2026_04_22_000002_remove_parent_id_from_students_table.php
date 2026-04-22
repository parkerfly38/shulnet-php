<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Migrate existing parent_id data to the pivot table
        DB::statement('
            INSERT INTO parent_student (parent_id, student_id, created_at, updated_at)
            SELECT parent_id, id, NOW(), NOW()
            FROM students
            WHERE parent_id IS NOT NULL
        ');
        
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->constrained('parents')->nullOnDelete();
        });
        
        // Migrate first parent back to parent_id column (best effort)
        DB::statement('
            UPDATE students s
            INNER JOIN (
                SELECT student_id, MIN(parent_id) as parent_id
                FROM parent_student
                GROUP BY student_id
            ) ps ON s.id = ps.student_id
            SET s.parent_id = ps.parent_id
        ');
    }
};
