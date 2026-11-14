<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\EnrollmentResource;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Enrollment::with(['student.user', 'course.department'])
            ->when($request->course_id,  fn($q, $c) => $q->where('course_id', $c))
            ->when($request->student_id, fn($q, $s) => $q->where('student_id', $s))
            ->when($request->status,     fn($q, $s) => $q->where('status', $s))
            ->latest();

        // Students see only their own enrollments
        if ($user->isStudent()) {
            $query->where('student_id', $user->student->id);
        }

        $paginator = $query->paginate($request->per_page ?? 15);
        return response()->json([
            'enrollments' => [
                'data'         => EnrollmentResource::collection($paginator->items()),
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
        $user = $request->user();

        // If the requester is a student, auto-use their own student ID
        $studentId = $user->isStudent()
            ? $user->student->id
            : $request->student_id;

        $request->validate([
            'course_id' => 'required|exists:courses,id',
            ...($user->isStudent() ? [] : ['student_id' => 'required|exists:students,id']),
        ]);

        // Prevent duplicate enrollment
        if (Enrollment::where('student_id', $studentId)
                      ->where('course_id', $request->course_id)
                      ->exists()) {
            return response()->json(['message' => 'Student is already enrolled in this course.'], 422);
        }

        // Check course capacity
        $course = \App\Models\Course::find($request->course_id);
        $approvedCount = Enrollment::where('course_id', $course->id)->where('status', 'approved')->count();

        if ($approvedCount >= $course->max_students) {
            return response()->json(['message' => 'Course has reached maximum capacity.'], 422);
        }

        $enrollment = Enrollment::create([
            'student_id'  => $studentId,
            'course_id'   => $request->course_id,
            'status'      => 'pending',
            'enrolled_at' => now(),
            'notes'       => $request->notes,
        ]);

        return response()->json([
            'message'    => 'Enrollment request submitted.',
            'enrollment' => new EnrollmentResource($enrollment->load('student.user', 'course')),
        ], 201);
    }

    public function show(Enrollment $enrollment): JsonResponse
    {
        return response()->json([
            'enrollment' => new EnrollmentResource($enrollment->load('student.user', 'course.department')),
        ]);
    }

    public function destroy(Enrollment $enrollment): JsonResponse
    {
        $enrollment->delete();

        return response()->json(['message' => 'Enrollment removed.']);
    }

    /** Approve an enrollment */
    public function approve(Request $request, Enrollment $enrollment): JsonResponse
    {
        if ($enrollment->status !== 'pending') {
            return response()->json(['message' => 'Only pending enrollments can be approved.'], 422);
        }

        $enrollment->update([
            'status'      => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        return response()->json([
            'message'    => 'Enrollment approved.',
            'enrollment' => new EnrollmentResource($enrollment->load('student.user', 'course')),
        ]);
    }

    /** Reject an enrollment */
    public function reject(Request $request, Enrollment $enrollment): JsonResponse
    {
        $enrollment->update([
            'status' => 'rejected',
            'notes'  => $request->reason,
        ]);

        return response()->json(['message' => 'Enrollment rejected.']);
    }
}
