<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'student_profile_id' => 'required|exists:students,id',
            'department_id'      => 'nullable|exists:departments,id',
            'semester_id'        => 'nullable|exists:semesters,id',
            'academic_year_id'   => 'nullable|exists:academic_years,id',
            'date_of_birth'      => 'nullable|date',
            'gender'             => 'nullable|in:male,female,other',
            'enrollment_date'    => 'nullable|date',
            'status'             => 'nullable|in:active,inactive,graduated,suspended',
        ];
    }
}
