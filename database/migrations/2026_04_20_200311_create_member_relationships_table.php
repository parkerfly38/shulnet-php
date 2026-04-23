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
        Schema::create('member_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->foreignId('related_member_id')->constrained('members')->onDelete('cascade');
            $table->string('relationship_type'); // 'parent', 'child', 'spouse', 'sibling', 'son', 'daughter', etc.
            $table->timestamps();

            // Prevent duplicate relationships (with shorter constraint name)
            $table->unique(['member_id', 'related_member_id', 'relationship_type'], 'member_rel_unique');
            
            // Add indexes for performance
            $table->index('member_id');
            $table->index('related_member_id');
            $table->index('relationship_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_relationships');
    }
};
