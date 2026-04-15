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

    /**
     * Duplicate a course (with all its videos) into a target category.
     */
    public function duplicate(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'title'       => ['nullable', 'string', 'max:255'],
        ]);

        $newTitle = $validated['title'] ?? ($course->title . ' (cópia)');

        $baseSlug = Str::slug($newTitle);
        $slug = $baseSlug;
        $i = 2;
        while (Course::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i;
            $i++;
        }

        $newCourse = $course->replicate(['published_at']);
        $newCourse->title = $newTitle;
        $newCourse->slug = $slug;
        $newCourse->category_id = $validated['category_id'];
        $newCourse->instructor_id = $request->user()->id;
        $newCourse->published_at = $course->status === 'published' ? now() : null;
        $newCourse->save();

        foreach ($course->videos()->orderBy('sort_order')->get() as $video) {
            $copy = $video->replicate();
            $copy->course_id = $newCourse->id;
            $copy->save();
        }

        $newCourse->load(['instructor:id,name', 'category:id,name']);

        return response()->json($newCourse, 201);
    }
}
