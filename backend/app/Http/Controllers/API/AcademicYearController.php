<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['academic_years' => AcademicYear::withCount('semesters')->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'       => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after:start_date',
            'is_current' => 'boolean',
        ]);

        if ($request->boolean('is_current')) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
        }

        $year = AcademicYear::create($request->all());

        return response()->json(['message' => 'Academic year created.', 'academic_year' => $year], 201);
    }

    public function show(AcademicYear $academicYear): JsonResponse
    {
        return response()->json(['academic_year' => $academicYear->load('semesters')]);
    }

    public function update(Request $request, AcademicYear $academicYear): JsonResponse
    {
        $request->validate([
            'name'       => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date',
            'is_current' => 'boolean',
        ]);

        if ($request->boolean('is_current')) {
            AcademicYear::where('is_current', true)->where('id', '!=', $academicYear->id)->update(['is_current' => false]);
        }

        $academicYear->update($request->all());

        return response()->json(['message' => 'Academic year updated.', 'academic_year' => $academicYear]);
    }

    public function destroy(AcademicYear $academicYear): JsonResponse
    {
        $academicYear->delete();
        return response()->json(['message' => 'Academic year deleted.']);
    }
}
