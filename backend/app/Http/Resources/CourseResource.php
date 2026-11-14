<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'code'            => $this->code,
            'name'            => $this->name,
            'description'     => $this->description,
            'credits'         => $this->credits,
            'max_students'    => $this->max_students,
            'enrolled_count'  => $this->enrolled_count,
            'status'          => $this->status,
            'department'      => $this->whenLoaded('department'),
            'semester'        => $this->whenLoaded('semester'),
            'academic_year'   => $this->whenLoaded('academicYear'),
            'teachers'        => $this->whenLoaded('teachers', fn() =>
                TeacherResource::collection($this->teachers)
            ),
            'enrollments_count' => $this->whenLoaded('enrollments', fn() =>
                $this->enrollments->count()
            ),
            'created_at'     => $this->created_at?->toDateTimeString(),
        ];
    }
}
