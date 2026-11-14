<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AssignmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'title'              => $this->title,
            'description'        => $this->description,
            'due_date'           => $this->due_date?->toDateTimeString(),
            'max_points'         => $this->max_points,
            'type'               => $this->type,
            'status'             => $this->status,
            'file_url'           => $this->file_path ? asset('storage/' . $this->file_path) : null,
            'submissions_count'  => $this->submissions_count,
            'course'             => $this->whenLoaded('course'),
            'teacher'            => $this->whenLoaded('teacher', fn() => new TeacherResource($this->teacher)),
            'created_at'         => $this->created_at?->toDateTimeString(),
        ];
    }
}
