<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'midterm_score'     => $this->midterm_score,
            'final_score'       => $this->final_score,
            'assignments_score' => $this->assignments_score,
            'attendance_score'  => $this->attendance_score,
            'total_score'       => $this->total_score,
            'grade_letter'      => $this->grade_letter,
            'gpa_points'        => $this->gpa_points,
            'remarks'           => $this->remarks,
            'student'           => $this->whenLoaded('student', fn() => new StudentResource($this->student)),
            'course'            => $this->whenLoaded('course'),
            'created_at'        => $this->created_at?->toDateTimeString(),
        ];
    }
}
