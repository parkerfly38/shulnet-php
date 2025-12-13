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
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->timestamp('last_renewal')->nullable();
            $table->timestamp('lastaction')->nullable();
            $table->timestamp('lastlogin')->nullable();
            $table->string('email')->nullable();
            $table->string('phone1')->nullable();
            $table->string('phone2')->nullable();
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('country')->nullable();
            $table->date('dob')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('title')->nullable();
            $table->string('gender')->nullable();
            $table->boolean('aliyah')->default(false);
            $table->date('bnaimitzvahdate')->nullable();
            $table->string('chazanut')->nullable();
            $table->string('tribe')->nullable();
            $table->boolean('dvartorah')->default(false);
            $table->boolean('deceased')->default(false);
            $table->string('father_hebrew_name')->nullable();
            $table->string('mother_hebrew_name')->nullable();
            $table->string('hebrew_name')->nullable();
            $table->boolean('briabatorah')->default(false);
            $table->boolean('maftir')->default(false);
            $table->date('anniversary_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
