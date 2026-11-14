<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'address'    => $this->address,
            'status'     => $this->status,
            'avatar_url' => $this->avatar_url,
            'role'       => $this->whenLoaded('role', fn() => [
                'id'           => $this->role->id,
                'name'         => $this->role->name,
                'display_name' => $this->role->display_name,
            ]),
            'student' => $this->whenLoaded('student', fn() =>
                new StudentResource($this->student)
            ),
            'teacher' => $this->whenLoaded('teacher', fn() =>
                new TeacherResource($this->teacher)
            ),
            'admin' => $this->whenLoaded('admin'),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
