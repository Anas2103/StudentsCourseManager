<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'code'            => $this->code,
            'description'     => $this->description,
            'status'          => $this->status,
            'teachers_count'  => $this->teachers_count ?? null,
            'students_count'  => $this->students_count ?? null,
            'courses_count'   => $this->courses_count  ?? null,
            'head_teacher'    => $this->whenLoaded('headTeacher', fn() =>
                $this->headTeacher ? new TeacherResource($this->headTeacher) : null
            ),
            'created_at'     => $this->created_at?->toDateTimeString(),
        ];
    }
}
