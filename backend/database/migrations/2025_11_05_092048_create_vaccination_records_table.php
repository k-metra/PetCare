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
        Schema::create('vaccination_records', function (Blueprint $table) {
            $table->id();
            $table->date('given_date');
            $table->string('vaccine_name');
            $table->string('veterinarian');
            $table->text('diagnosis')->nullable();
            $table->unsignedBigInteger('pet_id');
            $table->unsignedBigInteger('appointment_id')->nullable();
            $table->unsignedBigInteger('user_id'); // Pet owner for easy querying
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Indexes for better performance
            $table->index(['user_id', 'pet_id']);
            $table->index('given_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccination_records');
    }
};
