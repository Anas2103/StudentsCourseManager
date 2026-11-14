<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\StoreCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Course::with(['department', 'semester', 'academicYear', 'teachers.user'])
            ->when($request->search, fn($q, $s) =>
                $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%")
            )
            ->when($request->department_id,    fn($q, $d) => $q->where('department_id', $d))
            ->when($request->semester_id,      fn($q, $s) => $q->where('semester_id', $s))
            ->when($request->academic_year_id, fn($q, $a) => $q->where('academic_year_id', $a))
            ->when($request->status,           fn($q, $s) => $q->where('status', $s));

        // Teachers only see their own courses
        if ($user->isTeacher()) {
            $query->whereHas('teachers', fn($q) => $q->where('teachers.id', $user->teacher->id));
        }

        $paginator = $query->latest()->paginate($request->per_page ?? 15);
        return response()->json([
            'courses' => [
                'data'         => CourseResource::collection($paginator->items()),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = Course::create($request->validated());

        return response()->json([
            'message' => 'Course created.',
            'course'  => new CourseResource($course->load('department', 'semester')),
        ], 201);
    }

    public function show(Course $course): JsonResponse
    {
        return response()->json([
            'course' => new CourseResource(
                $course->load('department', 'semester', 'academicYear', 'teachers.user', 'enrollments')
            ),
        ]);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $request->validate([
            'name'             => 'sometimes|string|max:255',
            'code'             => 'sometimes|string|max:20|unique:courses,code,' . $course->id,
            'description'      => 'nullable|string',
            'credits'          => 'sometimes|integer|min:1|max:6',
            'department_id'    => 'nullable|exists:departments,id',
            'semester_id'      => 'nullable|exists:semesters,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'max_students'     => 'sometimes|integer|min:1',
            'status'           => 'sometimes|in:active,inactive,completed',
        ]);

        $course->update($request->all());

        return response()->json([
            'message' => 'Course updated.',
            'course'  => new CourseResource($course->fresh(['department', 'semester', 'teachers.user'])),
        ]);
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json(['message' => 'Course deleted.']);
    }

    /** Assign or replace the primary teacher */
    public function assignTeacher(Request $request, Course $course): JsonResponse
    {
        $request->validate([
            'teacher_id'  => 'required|exists:teachers,id',
            'is_primary'  => 'boolean',
        ]);

        $course->teachers()->sync([
            $request->teacher_id => ['is_primary' => $request->boolean('is_primary', true)],
        ]);

        return response()->json([
            'message' => 'Teacher assigned to course.',
            'course'  => new CourseResource($course->load('teachers.user')),
        ]);
    }

    /** List students enrolled in a course */
    public function students(Course $course): JsonResponse
    {
        $students = $course->students()->with('user')->where('enrollments.status', 'approved')->get();

        return response()->json(['students' => $students]);
    }

    /** List assignments for a course */
    public function assignments(Course $course): JsonResponse
    {
        $assignments = $course->assignments()->with('teacher.user')->latest()->get();

        return response()->json(['assignments' => $assignments]);
    }

    /** Upload course material (PDF / Doc) */
    public function uploadMaterial(Request $request, Course $course): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx|max:20480']);

        $path = $request->file('file')->store('course-materials/' . $course->id, 'public');

        return response()->json([
            'message'  => 'Material uploaded.',
            'file_url' => asset('storage/' . $path),
        ]);
    }
}
