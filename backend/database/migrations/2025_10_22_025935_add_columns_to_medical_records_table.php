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
        Schema::table('medical_records', function (Blueprint $table) {
            $table->unsignedBigInteger('appointment_id');
            $table->unsignedBigInteger('pet_id');
            $table->string('pet_name');
            $table->string('doctor_name');
            $table->decimal('weight', 5, 2)->nullable();
            $table->text('symptoms')->nullable();
            $table->text('medication')->nullable();
            $table->text('treatment')->nullable();
            $table->text('diagnosis')->nullable();
            $table->string('test_type')->nullable();
            $table->json('selected_tests')->nullable();
            $table->decimal('test_cost', 8, 2)->default(0);
            $table->text('notes')->nullable();

            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
            $table->foreign('pet_id')->references('id')->on('pets')->onDelete('cascade');
            
            $table->index('appointment_id');
            $table->index('pet_id');
            $table->index('doctor_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropForeign(['appointment_id']);
            $table->dropForeign(['pet_id']);
            $table->dropIndex(['appointment_id']);
            $table->dropIndex(['pet_id']);
            $table->dropIndex(['doctor_name']);
            
            $table->dropColumn([
                'appointment_id',
                'pet_id',
                'pet_name',
                'doctor_name',
                'weight',
                'symptoms',
                'medication',
                'treatment',
                'diagnosis',
                'test_type',
                'selected_tests',
                'test_cost',
                'notes'
            ]);
        });
    }
};
