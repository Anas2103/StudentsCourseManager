<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $classrooms = Classroom::when($request->search, fn($q, $s) =>
                $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%")
            )
            ->when($request->type,   fn($q, $t) => $q->where('type', $t))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->get();

        return response()->json(['classrooms' => $classrooms]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'code'     => 'required|string|max:20|unique:classrooms,code',
            'capacity' => 'required|integer|min:1',
            'building' => 'nullable|string',
            'floor'    => 'nullable|string',
            'type'     => 'required|in:lecture,lab,seminar',
        ]);

        $classroom = Classroom::create($request->all());

        return response()->json(['message' => 'Classroom created.', 'classroom' => $classroom], 201);
    }

    public function show(Classroom $classroom): JsonResponse
    {
        return response()->json(['classroom' => $classroom]);
    }

    public function update(Request $request, Classroom $classroom): JsonResponse
    {
        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'code'     => 'sometimes|string|max:20|unique:classrooms,code,' . $classroom->id,
            'capacity' => 'sometimes|integer|min:1',
            'type'     => 'sometimes|in:lecture,lab,seminar',
            'status'   => 'sometimes|in:active,inactive',
        ]);

        $classroom->update($request->all());

        return response()->json(['message' => 'Classroom updated.', 'classroom' => $classroom]);
    }

    public function destroy(Classroom $classroom): JsonResponse
    {
        $classroom->delete();
        return response()->json(['message' => 'Classroom deleted.']);
    }
}
