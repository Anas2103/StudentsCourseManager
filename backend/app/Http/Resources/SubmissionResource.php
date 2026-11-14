<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SubmissionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'content'       => $this->content,
            'file_url'      => $this->file_path ? asset('storage/' . $this->file_path) : null,
            'submitted_at'  => $this->submitted_at?->toDateTimeString(),
            'points_earned' => $this->points_earned,
            'graded_at'     => $this->graded_at?->toDateTimeString(),
            'feedback'      => $this->feedback,
            'status'        => $this->status,
            'assignment'    => $this->whenLoaded('assignment', fn() => new AssignmentResource($this->assignment)),
            'student'       => $this->whenLoaded('student',    fn() => new StudentResource($this->student)),
            'created_at'    => $this->created_at?->toDateTimeString(),
        ];
    }
}
