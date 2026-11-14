<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $departments = Department::with('headTeacher.user')
            ->withCount(['teachers', 'students', 'courses'])
            ->when($request->search, fn($q, $s) =>
                $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%")
            )
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->get();

        return response()->json(['departments' => DepartmentResource::collection($departments)]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'code'            => 'required|string|max:20|unique:departments,code',
            'description'     => 'nullable|string',
            'head_teacher_id' => 'nullable|exists:teachers,id',
            'status'          => 'in:active,inactive',
        ]);

        $dept = Department::create($request->all());

        return response()->json([
            'message'    => 'Department created.',
            'department' => new DepartmentResource($dept->load('headTeacher.user')),
        ], 201);
    }

    public function show(Department $department): JsonResponse
    {
        return response()->json([
            'department' => new DepartmentResource(
                $department->load('headTeacher.user', 'teachers.user', 'courses')
            ),
        ]);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $request->validate([
            'name'            => 'sometimes|string|max:255',
            'code'            => 'sometimes|string|max:20|unique:departments,code,' . $department->id,
            'description'     => 'nullable|string',
            'head_teacher_id' => 'nullable|exists:teachers,id',
            'status'          => 'in:active,inactive',
        ]);

        $department->update($request->all());

        return response()->json([
            'message'    => 'Department updated.',
            'department' => new DepartmentResource($department->fresh('headTeacher.user')),
        ]);
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();

        return response()->json(['message' => 'Department deleted.']);
    }
}
