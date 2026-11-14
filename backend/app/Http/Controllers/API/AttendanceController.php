<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Attendance::with(['student.user', 'course'])
            ->when($request->course_id,  fn($q, $c) => $q->where('course_id', $c))
            ->when($request->student_id, fn($q, $s) => $q->where('student_id', $s))
            ->when($request->date,       fn($q, $d) => $q->whereDate('date', $d))
            ->when($request->status,     fn($q, $s) => $q->where('status', $s))
            ->latest('date');

        if ($user->isStudent()) {
            $query->where('student_id', $user->student->id);
        }

        if ($user->isTeacher()) {
            $courseIds = $user->teacher->courses()->pluck('courses.id');
            $query->whereIn('course_id', $courseIds);
        }

        $paginator = $query->paginate($request->per_page ?? 30);
        return response()->json([
            'attendance' => [
                'data'         => AttendanceResource::collection($paginator->items()),
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
            'course_id'  => 'required|exists:courses,id',
            'student_id' => 'required|exists:students,id',
            'date'       => 'required|date',
            'status'     => 'required|in:present,absent,late,excused',
            'notes'      => 'nullable|string',
        ]);

        $record = Attendance::updateOrCreate(
            ['course_id' => $request->course_id, 'student_id' => $request->student_id, 'date' => \Carbon\Carbon::parse($request->date)->startOfDay()],
            ['status' => $request->status, 'notes' => $request->notes, 'created_by' => $request->user()->id]
        );

        return response()->json([
            'message'    => 'Attendance recorded.',
            'attendance' => new AttendanceResource($record->load('student.user', 'course')),
        ], 201);
    }

    public function show(Attendance $attendance): JsonResponse
    {
        return response()->json([
            'attendance' => new AttendanceResource($attendance->load('student.user', 'course')),
        ]);
    }

    public function update(Request $request, Attendance $attendance): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:present,absent,late,excused',
            'notes'  => 'nullable|string',
        ]);

        $attendance->update($request->only('status', 'notes'));

        return response()->json([
            'message'    => 'Attendance updated.',
            'attendance' => new AttendanceResource($attendance->fresh()),
        ]);
    }

    public function destroy(Attendance $attendance): JsonResponse
    {
        $attendance->delete();

        return response()->json(['message' => 'Attendance record deleted.']);
    }

    /** Record attendance for all students in a course at once */
    public function bulkStore(Request $request): JsonResponse
    {
        $request->validate([
            'course_id'   => 'required|exists:courses,id',
            'date'        => 'required|date',
            'records'     => 'required|array',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.status'     => 'required|in:present,absent,late,excused',
        ]);

        $saved = [];
        foreach ($request->records as $record) {
            $saved[] = Attendance::updateOrCreate(
                [
                    'course_id'  => $request->course_id,
                    'student_id' => $record['student_id'],
                    'date'       => \Carbon\Carbon::parse($request->date)->startOfDay(), // match the datetime the 'date' cast stores
                ],
                [
                    'status'     => $record['status'],
                    'notes'      => $record['notes'] ?? null,
                    'created_by' => $request->user()->id,
                ]
            );
        }

        return response()->json([
            'message' => count($saved) . ' attendance records saved.',
            'count'   => count($saved),
        ]);
    }

    public function byCourse(Course $course): JsonResponse
    {
        $records = Attendance::where('course_id', $course->id)->with('student.user')->latest('date')->get();

        return response()->json(['attendance' => AttendanceResource::collection($records)]);
    }

    public function byStudent(Student $student): JsonResponse
    {
        $records = Attendance::where('student_id', $student->id)->with('course')->latest('date')->get();

        return response()->json(['attendance' => AttendanceResource::collection($records)]);
    }
}
