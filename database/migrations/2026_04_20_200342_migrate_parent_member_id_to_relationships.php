<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate existing parent_member_id data to member_relationships
        DB::table('members')
            ->whereNotNull('parent_member_id')
            ->orderBy('id')
            ->chunk(100, function ($members) {
                foreach ($members as $member) {
                    // Create a 'child' relationship from parent to this member
                    DB::table('member_relationships')->insert([
                        'member_id' => $member->parent_member_id,
                        'related_member_id' => $member->id,
                        'relationship_type' => 'child',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            });

        // Remove the old parent_member_id column
        Schema::table('members', function (Blueprint $table) {
            $table->dropForeign(['parent_member_id']);
            $table->dropColumn('parent_member_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add the parent_member_id column
        Schema::table('members', function (Blueprint $table) {
            $table->foreignId('parent_member_id')->nullable()->after('parent_id')->constrained('members')->onDelete('cascade');
        });

        // Migrate data back from member_relationships
        DB::table('member_relationships')
            ->where('relationship_type', 'child')
            ->orderBy('id')
            ->chunk(100, function ($relationships) {
                foreach ($relationships as $relationship) {
                    DB::table('members')
                        ->where('id', $relationship->related_member_id)
                        ->update(['parent_member_id' => $relationship->member_id]);
                }
            });

        // Note: We don't delete from member_relationships in case there are other relationship types
    }
};
