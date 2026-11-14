<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Announcement::with(['author:id,name,avatar', 'course:id,name,code'])
            ->where('is_active', true)
            ->when($request->course_id, fn($q, $c) => $q->where('course_id', $c))
            ->latest();

        // Filter by role audience
        $query->where(function ($q) use ($user) {
            $q->where('target_role', 'all')
              ->orWhere('target_role', $user->role?->name);
        });

        $paginator = $query->paginate($request->per_page ?? 15);
        return response()->json([
            'announcements' => [
                'data'         => AnnouncementResource::collection($paginator->items()),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'target_role' => 'required|in:all,student,teacher,admin',
            'course_id'   => 'nullable|exists:courses,id',
            'is_active'   => 'boolean',
        ]);

        $announcement = Announcement::create([
            'user_id'      => $request->user()->id,
            'title'        => $request->title,
            'content'      => $request->content,
            'target_role'  => $request->target_role,
            'course_id'    => $request->course_id,
            'is_active'    => $request->boolean('is_active', true),
            'published_at' => now(),
        ]);

        return response()->json([
            'message'      => 'Announcement published.',
            'announcement' => new AnnouncementResource($announcement->load('author')),
        ], 201);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return response()->json([
            'announcement' => new AnnouncementResource($announcement->load('author', 'course')),
        ]);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'content'     => 'sometimes|string',
            'target_role' => 'sometimes|in:all,student,teacher,admin',
            'course_id'   => 'nullable|exists:courses,id',
            'is_active'   => 'boolean',
        ]);

        $announcement->update($request->all());

        return response()->json([
            'message'      => 'Announcement updated.',
            'announcement' => new AnnouncementResource($announcement->fresh('author')),
        ]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }
}
