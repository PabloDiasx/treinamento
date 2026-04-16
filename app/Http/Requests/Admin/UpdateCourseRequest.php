<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $courseId = $this->route('course')?->id;

        return [
            'title'             => ['sometimes', 'string', 'max:255'],
            'slug'              => ['sometimes', 'string', 'max:255', 'unique:courses,slug,' . $courseId],
            'category_id'       => ['sometimes', 'exists:categories,id'],
            'description'       => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'difficulty'        => ['nullable', 'string'],
            'estimated_hours'   => ['nullable', 'numeric', 'min:0'],
            'status'            => ['nullable', 'string', 'in:draft,published,archived'],
            'is_featured'       => ['nullable'],
            'video_url'         => ['nullable', 'string', 'max:500'],
            'video_source'      => ['nullable', 'string', 'in:local,youtube,vimeo,external'],
        ];
    }
}
