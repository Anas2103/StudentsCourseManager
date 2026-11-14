<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = trim($request->get('q', ''));

        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $like = "%{$q}%";

        $students = Student::with('user:id,name,email,avatar_url')
            ->whereHas('user', fn($qu) => $qu->where('name', 'like', $like)
                ->orWhere('email', 'like', $like))
            ->orWhere('student_id', 'like', $like)
            ->limit(5)->get()
            ->map(fn($s) => [
                'type'     => 'student',
                'id'       => $s->id,
                'label'    => $s->user->name,
                'sub'      => $s->student_id,
                'avatar'   => $s->user->avatar_url,
                'link'     => '/students/' . $s->id,
            ]);

        $teachers = Teacher::with('user:id,name,email,avatar_url', 'department:id,name')
            ->whereHas('user', fn($qu) => $qu->where('name', 'like', $like)
                ->orWhere('email', 'like', $like))
            ->orWhere('teacher_id', 'like', $like)
            ->orWhere('specialization', 'like', $like)
            ->limit(5)->get()
            ->map(fn($t) => [
                'type'   => 'teacher',
                'id'     => $t->id,
                'label'  => $t->user->name,
                'sub'    => $t->specialization ?? $t->department?->name,
                'avatar' => $t->user->avatar_url,
                'link'   => '/teachers',
            ]);

        $courses = Course::with('department:id,name')
            ->where('name', 'like', $like)
            ->orWhere('code', 'like', $like)
            ->orWhere('description', 'like', $like)
            ->limit(5)->get()
            ->map(fn($c) => [
                'type'  => 'course',
                'id'    => $c->id,
                'label' => $c->name,
                'sub'   => $c->code . ($c->department ? ' · ' . $c->department->name : ''),
                'link'  => '/courses/' . $c->id,
            ]);

        $results = collect()
            ->concat($students)
            ->concat($teachers)
            ->concat($courses)
            ->values();

        return response()->json(['results' => $results]);
    }
}
