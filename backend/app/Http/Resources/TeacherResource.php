<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'teacher_id'       => $this->teacher_id,
            'qualification'    => $this->qualification,
            'specialization'   => $this->specialization,
            'experience_years' => $this->experience_years,
            'join_date'        => $this->join_date?->toDateString(),
            'status'           => $this->status,
            'user'             => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'department'       => $this->whenLoaded('department'),
            'courses'          => $this->whenLoaded('courses'),
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}
