<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('class_definitions', function (Blueprint $table) {
            if (!Schema::hasColumn('class_definitions', 'class_number')) {
                $table->string('class_number')->nullable()->after('name');
            }
            if (!Schema::hasColumn('class_definitions', 'capacity')) {
                $table->integer('capacity')->nullable()->after('class_number');
            }
            if (!Schema::hasColumn('class_definitions', 'teacher_id')) {
                $table->foreignId('teacher_id')->nullable()->constrained('teachers')->nullOnDelete()->after('capacity');
            }
            if (!Schema::hasColumn('class_definitions', 'start_date')) {
                $table->date('start_date')->nullable()->after('teacher_id');
            }
            if (!Schema::hasColumn('class_definitions', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
            if (!Schema::hasColumn('class_definitions', 'location')) {
                $table->string('location')->nullable()->after('end_date');
            }
            if (!Schema::hasColumn('class_definitions', 'fee')) {
                $table->decimal('fee', 8, 2)->nullable()->after('location');
            }
        });
    }

    public function down()
    {
        Schema::table('class_definitions', function (Blueprint $table) {
            if (Schema::hasColumn('class_definitions', 'fee')) {
                $table->dropColumn('fee');
            }
            if (Schema::hasColumn('class_definitions', 'location')) {
                $table->dropColumn('location');
            }
            if (Schema::hasColumn('class_definitions', 'end_date')) {
                $table->dropColumn('end_date');
            }
            if (Schema::hasColumn('class_definitions', 'start_date')) {
                $table->dropColumn('start_date');
            }
            if (Schema::hasColumn('class_definitions', 'teacher_id')) {
                $table->dropForeign(['teacher_id']);
                $table->dropColumn('teacher_id');
            }
            if (Schema::hasColumn('class_definitions', 'capacity')) {
                $table->dropColumn('capacity');
            }
            if (Schema::hasColumn('class_definitions', 'class_number')) {
                $table->dropColumn('class_number');
            }
        });
    }
};
