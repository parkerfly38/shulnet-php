<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('parents', function (Blueprint $table) {
            if (!Schema::hasColumn('parents', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('parents', 'address')) {
                $table->text('address')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('parents', 'picture_url')) {
                $table->string('picture_url')->nullable()->after('address');
            }
            if (!Schema::hasColumn('parents', 'notes')) {
                $table->text('notes')->nullable()->after('picture_url');
            }
        });
    }

    public function down()
    {
        Schema::table('parents', function (Blueprint $table) {
            if (Schema::hasColumn('parents', 'notes')) {
                $table->dropColumn('notes');
            }
            if (Schema::hasColumn('parents', 'picture_url')) {
                $table->dropColumn('picture_url');
            }
            if (Schema::hasColumn('parents', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('parents', 'date_of_birth')) {
                $table->dropColumn('date_of_birth');
            }
        });
    }
};
