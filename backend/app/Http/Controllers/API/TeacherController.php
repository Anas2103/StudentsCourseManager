<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeacherResource;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Teacher::with(['user', 'department'])
            ->when($request->search, fn($q, $s) =>
                $q->whereHas('user', fn($uq) =>
                    $uq->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")
                )->orWhere('teacher_id', 'like', "%{$s}%")
            )
            ->when($request->department_id, fn($q, $d) => $q->where('department_id', $d))
            ->when($request->status,        fn($q, $s) => $q->where('status', $s))
            ->latest();

        $paginator = $query->paginate($request->per_page ?? 15);
        return response()->json([
            'teachers' => [
                'data'         => TeacherResource::collection($paginator->items()),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function show(Teacher $teacher): JsonResponse
    {
        return response()->json([
            'teacher' => new TeacherResource($teacher->load('user', 'department', 'courses')),
        ]);
    }

    public function update(Request $request, Teacher $teacher): JsonResponse
    {
        $request->validate([
            'department_id'    => 'nullable|exists:departments,id',
            'qualification'    => 'nullable|string|max:255',
            'specialization'   => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'join_date'        => 'nullable|date',
            'status'           => 'nullable|in:active,inactive',
        ]);

        $teacher->update($request->all());

        if ($request->has('name') || $request->has('phone')) {
            $teacher->user->update($request->only('name', 'phone', 'address'));
        }

        return response()->json([
            'message' => 'Teacher updated.',
            'teacher' => new TeacherResource($teacher->fresh(['user', 'department'])),
        ]);
    }

    public function destroy(Teacher $teacher): JsonResponse
    {
        $teacher->user->delete();

        return response()->json(['message' => 'Teacher removed.']);
    }

    public function courses(Teacher $teacher): JsonResponse
    {
        $courses = $teacher->courses()->with('department', 'enrollments')->get();

        return response()->json(['courses' => $courses]);
    }
}
