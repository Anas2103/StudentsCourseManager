<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'student_id'       => $this->student_id,
            'date_of_birth'    => $this->date_of_birth?->toDateString(),
            'gender'           => $this->gender,
            'enrollment_date'  => $this->enrollment_date?->toDateString(),
            'gpa'              => $this->gpa,
            'status'           => $this->status,
            'user'             => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'department'       => $this->whenLoaded('department'),
            'semester'         => $this->whenLoaded('semester'),
            'academic_year'    => $this->whenLoaded('academicYear'),
            'enrollments'      => $this->whenLoaded('enrollments'),
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}
