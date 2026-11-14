<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'date'       => $this->date?->toDateString(),
            'status'     => $this->status,
            'notes'      => $this->notes,
            'student'    => $this->whenLoaded('student', fn() => new StudentResource($this->student)),
            'course'     => $this->whenLoaded('course'),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
