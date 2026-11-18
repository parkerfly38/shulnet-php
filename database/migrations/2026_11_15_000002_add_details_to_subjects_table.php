<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The subject forms already asked for a code, books, class and teacher, but the table had nowhere to keep them.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->string('subject_code')->nullable()->after('name');
            $table->text('books')->nullable()->after('description');
            $table->foreignId('class_id')->nullable()->after('books')->constrained('class_definitions')->nullOnDelete();
            $table->foreignId('teacher_id')->nullable()->after('class_id')->constrained('teachers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('teacher_id');
            $table->dropConstrainedForeignId('class_id');
            $table->dropColumn(['subject_code', 'books']);
        });
    }
};
