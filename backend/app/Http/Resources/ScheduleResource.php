<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'day_of_week' => $this->day_of_week,
            'start_time'  => $this->start_time ? date('H:i', strtotime($this->start_time)) : null,
            'end_time'    => $this->end_time   ? date('H:i', strtotime($this->end_time))   : null,
            'course'      => $this->whenLoaded('course'),
            'classroom'   => $this->whenLoaded('classroom'),
            'teacher'     => $this->whenLoaded('teacher', fn() => new TeacherResource($this->teacher)),
            'semester'    => $this->whenLoaded('semester'),
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}
