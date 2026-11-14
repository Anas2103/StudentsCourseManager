<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('teacher_id')->unique();   // e.g. TCH-0001
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('qualification')->nullable();
            $table->string('specialization')->nullable();
            $table->unsignedInteger('experience_years')->default(0);
            $table->date('join_date')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Add the deferred FK on departments now that teachers table exists
        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('head_teacher_id')->references('id')->on('teachers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['head_teacher_id']);
        });
        Schema::dropIfExists('teachers');
    }
};
