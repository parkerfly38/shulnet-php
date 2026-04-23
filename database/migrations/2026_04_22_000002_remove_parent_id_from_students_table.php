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
        $students = DB::table('students')
            ->whereNotNull('parent_id')
            ->get(['id', 'parent_id']);
        
        foreach ($students as $student) {
            DB::table('parent_student')->insert([
                'parent_id' => $student->parent_id,
                'student_id' => $student->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        
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
        $parentStudents = DB::table('parent_student')
            ->select('student_id', DB::raw('MIN(parent_id) as parent_id'))
            ->groupBy('student_id')
            ->get();
        
        foreach ($parentStudents as $ps) {
            DB::table('students')
                ->where('id', $ps->student_id)
                ->update(['parent_id' => $ps->parent_id]);
        }
    }
};
