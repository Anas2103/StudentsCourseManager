<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    protected $fillable = [
        'user_id', 'teacher_id', 'department_id',
        'qualification', 'specialization', 'experience_years',
        'join_date', 'status',
    ];

    protected $casts = ['join_date' => 'date'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /** Courses this teacher teaches (many-to-many) */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_teacher')
                    ->withPivot('is_primary')
                    ->withTimestamps();
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
