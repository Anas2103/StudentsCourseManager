<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'content'      => $this->content,
            'target_role'  => $this->target_role,
            'is_active'    => $this->is_active,
            'published_at' => $this->published_at?->toDateTimeString(),
            'author'       => $this->whenLoaded('author'),
            'course'       => $this->whenLoaded('course'),
            'created_at'   => $this->created_at?->toDateTimeString(),
        ];
    }
}
