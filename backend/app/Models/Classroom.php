<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classroom extends Model
{
    protected $fillable = ['name', 'code', 'capacity', 'building', 'floor', 'type', 'status'];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
