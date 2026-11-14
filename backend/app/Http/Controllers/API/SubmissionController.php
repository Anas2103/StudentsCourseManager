<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubmissionResource;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Submission::with(['assignment.course', 'student.user'])
            ->when($request->assignment_id, fn($q, $a) => $q->where('assignment_id', $a))
            ->when($request->status,        fn($q, $s) => $q->where('status', $s))
            ->latest();

        if ($user->isStudent()) {
            $query->where('student_id', $user->student->id);
        }

        return response()->json([
            'submissions' => SubmissionResource::collection($query->paginate($request->per_page ?? 15)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'assignment_id' => 'required|exists:assignments,id',
            'content'       => 'nullable|string',
            'file'          => 'nullable|file|max:20480',
        ]);

        $user = $request->user();

        // Prevent duplicate submission
        if (Submission::where('assignment_id', $request->assignment_id)
                      ->where('student_id', $user->student->id)
                      ->exists()) {
            return response()->json(['message' => 'You have already submitted this assignment.'], 422);
        }

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('submissions/' . $request->assignment_id, 'public');
        }

        $assignment = \App\Models\Assignment::find($request->assignment_id);
        $isLate     = now()->isAfter($assignment->due_date);

        $submission = Submission::create([
            'assignment_id' => $request->assignment_id,
            'student_id'    => $user->student->id,
            'content'       => $request->content,
            'file_path'     => $filePath,
            'submitted_at'  => now(),
            'status'        => $isLate ? 'late' : 'submitted',
        ]);

        return response()->json([
            'message'    => 'Assignment submitted.',
            'submission' => new SubmissionResource($submission->load('assignment', 'student.user')),
        ], 201);
    }

    public function show(Submission $submission): JsonResponse
    {
        return response()->json([
            'submission' => new SubmissionResource($submission->load('assignment.course', 'student.user')),
        ]);
    }

    public function destroy(Submission $submission): JsonResponse
    {
        $submission->delete();

        return response()->json(['message' => 'Submission deleted.']);
    }

    /** Teacher grades a submission */
    public function gradeSubmission(Request $request, Submission $submission): JsonResponse
    {
        $request->validate([
            'points_earned' => 'required|integer|min:0',
            'feedback'      => 'nullable|string',
        ]);

        $maxPoints = $submission->assignment->max_points;
        if ($request->points_earned > $maxPoints) {
            return response()->json(['message' => "Points cannot exceed max points ({$maxPoints})."], 422);
        }

        $submission->update([
            'points_earned' => $request->points_earned,
            'feedback'      => $request->feedback,
            'graded_at'     => now(),
            'graded_by'     => $request->user()->id,
            'status'        => 'graded',
        ]);

        return response()->json([
            'message'    => 'Submission graded.',
            'submission' => new SubmissionResource($submission->fresh()),
        ]);
    }
}
