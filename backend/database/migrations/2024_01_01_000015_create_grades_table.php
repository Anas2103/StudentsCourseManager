<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->float('midterm_score', 5, 2)->default(0);
            $table->float('final_score', 5, 2)->default(0);
            $table->float('assignments_score', 5, 2)->default(0);
            $table->float('attendance_score', 5, 2)->default(0);
            $table->float('total_score', 5, 2)->default(0);
            $table->string('grade_letter')->nullable();   // A, B+, B, etc.
            $table->float('gpa_points', 3, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
