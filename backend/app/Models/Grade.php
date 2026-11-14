<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    protected $fillable = [
        'enrollment_id', 'student_id', 'course_id',
        'midterm_score', 'final_score', 'assignments_score',
        'attendance_score', 'total_score', 'grade_letter',
        'gpa_points', 'remarks',
    ];

    protected $casts = [
        'midterm_score'     => 'float',
        'final_score'       => 'float',
        'assignments_score' => 'float',
        'attendance_score'  => 'float',
        'total_score'       => 'float',
        'gpa_points'        => 'float',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /** Calculate letter grade from total_score */
    public static function calculateLetterGrade(float $score): string
    {
        return match(true) {
            $score >= 95 => 'A+',
            $score >= 90 => 'A',
            $score >= 85 => 'A-',
            $score >= 80 => 'B+',
            $score >= 75 => 'B',
            $score >= 70 => 'B-',
            $score >= 65 => 'C+',
            $score >= 60 => 'C',
            $score >= 55 => 'C-',
            $score >= 50 => 'D',
            default      => 'F',
        };
    }

    /** Calculate GPA points from letter grade */
    public static function calculateGpaPoints(string $grade): float
    {
        return match($grade) {
            'A+'    => 4.0,
            'A'     => 4.0,
            'A-'    => 3.7,
            'B+'    => 3.3,
            'B'     => 3.0,
            'B-'    => 2.7,
            'C+'    => 2.3,
            'C'     => 2.0,
            'C-'    => 1.7,
            'D'     => 1.0,
            default => 0.0,
        };
    }
}
