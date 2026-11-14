<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\GradeResource;
use App\Models\Course;
use App\Models\Grade;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Grade::with(['student.user', 'course'])
            ->when($request->course_id,  fn($q, $c) => $q->where('course_id', $c))
            ->when($request->student_id, fn($q, $s) => $q->where('student_id', $s))
            ->latest();

        if ($user->isStudent()) {
            $query->where('student_id', $user->student->id);
        }

        if ($user->isTeacher()) {
            $courseIds = $user->teacher->courses()->pluck('courses.id');
            $query->whereIn('course_id', $courseIds);
        }

        $paginator = $query->paginate($request->per_page ?? 15);
        return response()->json([
            'grades' => [
                'data'         => GradeResource::collection($paginator->items()),
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
            'enrollment_id'     => 'required|exists:enrollments,id',
            'student_id'        => 'required|exists:students,id',
            'course_id'         => 'required|exists:courses,id',
            'midterm_score'     => 'nullable|numeric|min:0|max:100',
            'final_score'       => 'nullable|numeric|min:0|max:100',
            'assignments_score' => 'nullable|numeric|min:0|max:100',
            'attendance_score'  => 'nullable|numeric|min:0|max:100',
        ]);

        $data = $request->all();

        // Calculate total (weighted average)
        $total = ($data['midterm_score'] ?? 0) * 0.3
               + ($data['final_score'] ?? 0) * 0.4
               + ($data['assignments_score'] ?? 0) * 0.2
               + ($data['attendance_score'] ?? 0) * 0.1;

        $data['total_score']   = round($total, 2);
        $data['grade_letter']  = Grade::calculateLetterGrade($total);
        $data['gpa_points']    = Grade::calculateGpaPoints($data['grade_letter']);

        $grade = Grade::updateOrCreate(
            ['student_id' => $data['student_id'], 'course_id' => $data['course_id']],
            $data
        );

        return response()->json([
            'message' => 'Grade saved.',
            'grade'   => new GradeResource($grade->load('student.user', 'course')),
        ], 201);
    }

    public function show(Grade $grade): JsonResponse
    {
        return response()->json([
            'grade' => new GradeResource($grade->load('student.user', 'course')),
        ]);
    }

    public function update(Request $request, Grade $grade): JsonResponse
    {
        $request->validate([
            'midterm_score'     => 'nullable|numeric|min:0|max:100',
            'final_score'       => 'nullable|numeric|min:0|max:100',
            'assignments_score' => 'nullable|numeric|min:0|max:100',
            'attendance_score'  => 'nullable|numeric|min:0|max:100',
            'remarks'           => 'nullable|string',
        ]);

        $midterm    = $request->midterm_score     ?? $grade->midterm_score;
        $final      = $request->final_score       ?? $grade->final_score;
        $assign     = $request->assignments_score ?? $grade->assignments_score;
        $attendance = $request->attendance_score  ?? $grade->attendance_score;

        $total = $midterm * 0.3 + $final * 0.4 + $assign * 0.2 + $attendance * 0.1;

        $grade->update([
            'midterm_score'     => $midterm,
            'final_score'       => $final,
            'assignments_score' => $assign,
            'attendance_score'  => $attendance,
            'total_score'       => round($total, 2),
            'grade_letter'      => Grade::calculateLetterGrade($total),
            'gpa_points'        => Grade::calculateGpaPoints(Grade::calculateLetterGrade($total)),
            'remarks'           => $request->remarks ?? $grade->remarks,
        ]);

        return response()->json([
            'message' => 'Grade updated.',
            'grade'   => new GradeResource($grade->fresh()),
        ]);
    }

    public function destroy(Grade $grade): JsonResponse
    {
        $grade->delete();

        return response()->json(['message' => 'Grade deleted.']);
    }

    public function byCourse(Course $course): JsonResponse
    {
        $grades = Grade::where('course_id', $course->id)->with('student.user')->get();

        return response()->json(['grades' => GradeResource::collection($grades)]);
    }

    public function byStudent(Student $student): JsonResponse
    {
        $grades = Grade::where('student_id', $student->id)->with('course')->get();

        return response()->json(['grades' => GradeResource::collection($grades)]);
    }
}
