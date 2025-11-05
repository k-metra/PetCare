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
        Schema::dropIfExists('vaccination_records');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('vaccination_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pet_id');
            $table->unsignedBigInteger('user_id');
            $table->date('given_date');
            $table->string('vaccine_name');
            $table->string('veterinarian');
            $table->text('diagnosis')->nullable();
            $table->unsignedBigInteger('appointment_id')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'pet_id']);
            $table->index('given_date');
        });
    }
};
