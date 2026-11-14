<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['semesters' => Semester::with('academicYear')->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'academic_year_id' => 'required|exists:academic_years,id',
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after:start_date',
            'is_current'       => 'boolean',
        ]);

        if ($request->boolean('is_current')) {
            Semester::where('is_current', true)->update(['is_current' => false]);
        }

        $semester = Semester::create($request->all());

        return response()->json(['message' => 'Semester created.', 'semester' => $semester], 201);
    }

    public function show(Semester $semester): JsonResponse
    {
        return response()->json(['semester' => $semester->load('academicYear')]);
    }

    public function update(Request $request, Semester $semester): JsonResponse
    {
        $request->validate([
            'name'       => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date',
            'is_current' => 'boolean',
        ]);

        if ($request->boolean('is_current')) {
            Semester::where('is_current', true)->where('id', '!=', $semester->id)->update(['is_current' => false]);
        }

        $semester->update($request->all());

        return response()->json(['message' => 'Semester updated.', 'semester' => $semester]);
    }

    public function destroy(Semester $semester): JsonResponse
    {
        $semester->delete();
        return response()->json(['message' => 'Semester deleted.']);
    }
}
