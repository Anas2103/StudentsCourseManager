<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssignmentResource;
use App\Http\Resources\SubmissionResource;
use App\Models\Assignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Assignment::with(['course', 'teacher.user'])
            ->when($request->course_id, fn($q, $c) => $q->where('course_id', $c))
            ->when($request->type,      fn($q, $t) => $q->where('type', $t))
            ->when($request->status,    fn($q, $s) => $q->where('status', $s))
            ->latest();

        // Teachers see only their own assignments
        if ($user->isTeacher()) {
            $query->where('teacher_id', $user->teacher->id);
        }

        // Students see assignments for their enrolled courses only
        if ($user->isStudent()) {
            $courseIds = $user->student->enrollments()->where('status', 'approved')->pluck('course_id');
            $query->whereIn('course_id', $courseIds);
        }

        $paginator = $query->paginate($request->per_page ?? 15);
        return response()->json([
            'assignments' => [
                'data'         => AssignmentResource::collection($paginator->items()),
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
            'course_id'   => 'required|exists:courses,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'required|date|after:now',
            'max_points'  => 'required|integer|min:1|max:1000',
            'type'        => 'required|in:homework,project,quiz,exam',
        ]);

        $user = $request->user();
        $teacherId = $user->isTeacher() ? $user->teacher->id : $request->teacher_id;

        $assignment = Assignment::create(array_merge(
            $request->except('teacher_id'),
            ['teacher_id' => $teacherId]
        ));

        return response()->json([
            'message'    => 'Assignment created.',
            'assignment' => new AssignmentResource($assignment->load('course', 'teacher.user')),
        ], 201);
    }

    public function show(Assignment $assignment): JsonResponse
    {
        return response()->json([
            'assignment' => new AssignmentResource($assignment->load('course', 'teacher.user')),
        ]);
    }

    public function update(Request $request, Assignment $assignment): JsonResponse
    {
        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'sometimes|date',
            'max_points'  => 'sometimes|integer|min:1|max:1000',
            'type'        => 'sometimes|in:homework,project,quiz,exam',
            'status'      => 'sometimes|in:active,closed',
        ]);

        $assignment->update($request->all());

        return response()->json([
            'message'    => 'Assignment updated.',
            'assignment' => new AssignmentResource($assignment->fresh(['course', 'teacher.user'])),
        ]);
    }

    public function destroy(Assignment $assignment): JsonResponse
    {
        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted.']);
    }

    public function submissions(Assignment $assignment): JsonResponse
    {
        $submissions = $assignment->submissions()->with('student.user')->latest()->get();

        return response()->json(['submissions' => SubmissionResource::collection($submissions)]);
    }

    public function uploadFile(Request $request, Assignment $assignment): JsonResponse
    {
        $request->validate(['file' => 'required|file|max:20480']);

        $path = $request->file('file')->store('assignments/' . $assignment->id, 'public');
        $assignment->update(['file_path' => $path]);

        return response()->json([
            'message'  => 'File uploaded.',
            'file_url' => asset('storage/' . $path),
        ]);
    }
}
