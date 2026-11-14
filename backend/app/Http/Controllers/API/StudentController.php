<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\GradeResource;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['user', 'department', 'semester', 'academicYear'])
            ->when($request->search, fn($q, $s) =>
                $q->whereHas('user', fn($uq) =>
                    $uq->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")
                )->orWhere('student_id', 'like', "%{$s}%")
            )
            ->when($request->department_id, fn($q, $d) => $q->where('department_id', $d))
            ->when($request->semester_id,   fn($q, $s) => $q->where('semester_id', $s))
            ->when($request->status,        fn($q, $s) => $q->where('status', $s))
            ->latest();

        $paginator = $query->paginate($request->per_page ?? 15);
        return response()->json([
            'students' => [
                'data'         => StudentResource::collection($paginator->items()),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $student = Student::find($request->student_profile_id);

        if (! $student) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $student->update($request->validated());

        return response()->json([
            'message' => 'Student profile updated.',
            'student' => new StudentResource($student->load('user', 'department')),
        ]);
    }

    public function show(Student $student): JsonResponse
    {
        return response()->json([
            'student' => new StudentResource(
                $student->load('user', 'department', 'semester', 'academicYear', 'enrollments.course')
            ),
        ]);
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $request->validate([
            'department_id'   => 'nullable|exists:departments,id',
            'semester_id'     => 'nullable|exists:semesters,id',
            'academic_year_id'=> 'nullable|exists:academic_years,id',
            'date_of_birth'   => 'nullable|date',
            'gender'          => 'nullable|in:male,female,other',
            'enrollment_date' => 'nullable|date',
            'status'          => 'nullable|in:active,inactive,graduated,suspended',
        ]);

        $student->update($request->all());

        // Sync user fields if provided
        if ($request->has('name') || $request->has('email') || $request->has('phone')) {
            $student->user->update($request->only('name', 'email', 'phone'));
        }

        return response()->json([
            'message' => 'Student updated.',
            'student' => new StudentResource($student->fresh(['user', 'department'])),
        ]);
    }

    public function destroy(Student $student): JsonResponse
    {
        $student->user->delete();   // soft-deletes cascade to student

        return response()->json(['message' => 'Student removed.']);
    }

    /** List courses for a specific student */
    public function courses(Student $student): JsonResponse
    {
        $courses = $student->courses()->with('department', 'teachers.user')->get();

        return response()->json(['courses' => $courses]);
    }

    /** Grades for a specific student */
    public function grades(Student $student): JsonResponse
    {
        $grades = $student->grades()->with('course')->get();

        return response()->json(['grades' => GradeResource::collection($grades)]);
    }

    /** Attendance for a specific student */
    public function attendance(Student $student): JsonResponse
    {
        $attendance = $student->attendance()->with('course')->latest('date')->get();

        return response()->json(['attendance' => AttendanceResource::collection($attendance)]);
    }
}
