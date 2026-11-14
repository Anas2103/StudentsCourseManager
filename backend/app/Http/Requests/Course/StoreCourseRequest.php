<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code'             => 'required|string|max:20|unique:courses,code',
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'credits'          => 'required|integer|min:1|max:6',
            'department_id'    => 'nullable|exists:departments,id',
            'semester_id'      => 'nullable|exists:semesters,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'max_students'     => 'required|integer|min:1',
            'status'           => 'in:active,inactive,completed',
        ];
    }
}
