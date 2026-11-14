<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScheduleResource;
use App\Models\Course;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Schedule::with(['course', 'classroom', 'teacher.user', 'semester'])
            ->when($request->course_id,   fn($q, $c) => $q->where('course_id', $c))
            ->when($request->teacher_id,  fn($q, $t) => $q->where('teacher_id', $t))
            ->when($request->semester_id, fn($q, $s) => $q->where('semester_id', $s))
            ->when($request->day,         fn($q, $d) => $q->where('day_of_week', $d))
            ->orderBy('day_of_week')
            ->orderBy('start_time');

        if ($user->isTeacher()) {
            $query->where('teacher_id', $user->teacher->id);
        }

        if ($user->isStudent()) {
            $courseIds = $user->student->enrollments()->where('status', 'approved')->pluck('course_id');
            $query->whereIn('course_id', $courseIds);
        }

        $paginator = $query->paginate($request->per_page ?? 30);
        return response()->json([
            'schedules' => [
                'data'         => ScheduleResource::collection($paginator->items()),
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
            'course_id'    => 'required|exists:courses,id',
            'teacher_id'   => 'required|exists:teachers,id',
            'classroom_id' => 'nullable|exists:classrooms,id',
            'semester_id'  => 'nullable|exists:semesters,id',
            'day_of_week'  => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time'   => 'required|date_format:H:i',
            'end_time'     => 'required|date_format:H:i|after:start_time',
        ]);

        $schedule = Schedule::create($request->all());

        return response()->json([
            'message'  => 'Schedule created.',
            'schedule' => new ScheduleResource($schedule->load('course', 'classroom', 'teacher.user')),
        ], 201);
    }

    public function show(Schedule $schedule): JsonResponse
    {
        return response()->json([
            'schedule' => new ScheduleResource($schedule->load('course', 'classroom', 'teacher.user', 'semester')),
        ]);
    }

    public function update(Request $request, Schedule $schedule): JsonResponse
    {
        $request->validate([
            'day_of_week'  => 'sometimes|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time'   => 'sometimes|date_format:H:i',
            'end_time'     => 'sometimes|date_format:H:i',
            'classroom_id' => 'nullable|exists:classrooms,id',
            'semester_id'  => 'nullable|exists:semesters,id',
        ]);

        $schedule->update($request->all());

        return response()->json([
            'message'  => 'Schedule updated.',
            'schedule' => new ScheduleResource($schedule->fresh(['course', 'classroom', 'teacher.user'])),
        ]);
    }

    public function destroy(Schedule $schedule): JsonResponse
    {
        $schedule->delete();

        return response()->json(['message' => 'Schedule deleted.']);
    }

    public function byCourse(Course $course): JsonResponse
    {
        $schedules = Schedule::where('course_id', $course->id)
                             ->with('classroom', 'teacher.user', 'semester')
                             ->get();

        return response()->json(['schedules' => ScheduleResource::collection($schedules)]);
    }
}
