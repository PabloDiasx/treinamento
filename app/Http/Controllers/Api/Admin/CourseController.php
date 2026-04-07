<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        $courses = Course::with(['instructor:id,name', 'category:id,name'])
            ->latest()
            ->paginate(20);

        return response()->json($courses);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'             => ['required', 'string', 'max:255'],
            'slug'              => ['required', 'string', 'max:255', 'unique:courses,slug'],
            'category_id'       => ['required', 'exists:categories,id'],
            'description'       => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'difficulty'        => ['nullable', 'string'],
            'estimated_hours'   => ['nullable', 'numeric', 'min:0'],
            'status'            => ['nullable', 'string', 'in:draft,published,archived'],
            'is_featured'       => ['nullable'],
            'video_url'         => ['nullable', 'string', 'max:500'],
            'video_source'      => ['nullable', 'string', 'in:local,youtube,vimeo,external'],
        ]);

        $validated['instructor_id'] = $request->user()->id;
        $validated['is_featured'] = filter_var($validated['is_featured'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (($validated['status'] ?? '') === 'published') {
            $validated['published_at'] = now();
        }

        $course = Course::create($validated);

        return response()->json($course, 201);
    }

    public function show(Course $course): JsonResponse
    {
        $course->load([
            'instructor:id,name,email',
            'category:id,name,slug',
        ]);

        return response()->json($course);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'title'             => ['sometimes', 'string', 'max:255'],
            'slug'              => ['sometimes', 'string', 'max:255', 'unique:courses,slug,' . $course->id],
            'category_id'       => ['sometimes', 'exists:categories,id'],
            'description'       => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'difficulty'        => ['nullable', 'string'],
            'estimated_hours'   => ['nullable', 'numeric', 'min:0'],
            'status'            => ['nullable', 'string', 'in:draft,published,archived'],
            'is_featured'       => ['nullable'],
            'video_url'         => ['nullable', 'string', 'max:500'],
            'video_source'      => ['nullable', 'string', 'in:local,youtube,vimeo,external'],
        ]);

        $validated['is_featured'] = filter_var($validated['is_featured'] ?? $course->is_featured, FILTER_VALIDATE_BOOLEAN);

        if (($validated['status'] ?? '') === 'published' && ! $course->published_at) {
            $validated['published_at'] = now();
        }

        $course->update($validated);

        return response()->json($course->fresh());
    }

    /**
     * Upload a video file for a course.
     */
    public function uploadVideo(Request $request, Course $course): JsonResponse
    {
        $request->validate([
            'video' => ['required', 'file', 'mimes:mp4,webm,mov,avi', 'max:512000'],
        ]);

        $file = $request->file('video');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('videos', $filename);

        $course->update([
            'video_path'   => 'videos/' . $filename,
            'video_source' => 'local',
            'video_url'    => null,
        ]);

        return response()->json($course->fresh());
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json(['message' => 'Curso removido com sucesso.']);
    }
}
