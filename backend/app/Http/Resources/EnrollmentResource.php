<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'status'      => $this->status,
            'enrolled_at' => $this->enrolled_at?->toDateTimeString(),
            'approved_at' => $this->approved_at?->toDateTimeString(),
            'notes'       => $this->notes,
            'student'     => $this->whenLoaded('student', fn() => new StudentResource($this->student)),
            'course'      => $this->whenLoaded('course',  fn() => new CourseResource($this->course)),
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}
