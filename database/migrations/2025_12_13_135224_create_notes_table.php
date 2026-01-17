<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->enum('item_scope', ['User', 'Member', 'Contact']);
            $table->string('name');
            $table->dateTime('deadline_date')->nullable();
            $table->dateTime('completed_date')->nullable();
            $table->dateTime('seen_date')->nullable();
            $table->text('note_text')->nullable();
            $table->string('label')->nullable();
            $table->string('added_by')->nullable();
            $table->enum('visibility', ['Member', 'Admin', 'Broadcast']);
            $table->enum('priority', ['Low', 'Medium', 'High']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
