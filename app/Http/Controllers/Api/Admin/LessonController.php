<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ebook;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LessonController extends Controller
{
    /**
     * Return all lessons for a given module.
     */
    public function index(Module $module): JsonResponse
    {
        $lessons = $module->lessons()->get();

        return response()->json($lessons);
    }

    /**
     * Create a new lesson inside a module.
     */
    public function store(Request $request, Module $module): JsonResponse
    {
        $validated = $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'slug'             => ['required', 'string', 'max:255', 'unique:lessons,slug'],
            'type'             => ['required', 'string', 'in:video,ebook,text,quiz'],
            'content_url'      => ['nullable', 'string', 'max:500'],
            'video_source'     => ['nullable', 'string', 'in:local,youtube,vimeo,external'],
            'content_text'     => ['nullable', 'string'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'sort_order'       => ['nullable', 'integer', 'min:0'],
            'is_free_preview'  => ['nullable', 'boolean'],
        ]);

        $validated['module_id'] = $module->id;

        $lesson = Lesson::create($validated);

        return response()->json($lesson, 201);
    }

    /**
     * Return a single lesson with related data.
     */
    public function show(Lesson $lesson): JsonResponse
    {
        $lesson->load(['module:id,course_id,title', 'ebook']);

        return response()->json($lesson);
    }

    /**
     * Update an existing lesson.
     */
    public function update(Request $request, Lesson $lesson): JsonResponse
    {
        $validated = $request->validate([
            'title'            => ['sometimes', 'string', 'max:255'],
            'slug'             => ['sometimes', 'string', 'max:255', 'unique:lessons,slug,' . $lesson->id],
            'type'             => ['sometimes', 'string', 'in:video,ebook,text,quiz'],
            'content_url'      => ['nullable', 'string', 'max:500'],
            'video_source'     => ['nullable', 'string', 'in:local,youtube,vimeo,external'],
            'content_text'     => ['nullable', 'string'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'sort_order'       => ['nullable', 'integer', 'min:0'],
            'is_free_preview'  => ['nullable', 'boolean'],
        ]);

        $lesson->update($validated);

        return response()->json($lesson->fresh());
    }

    /**
     * Delete a lesson.
     */
    public function destroy(Lesson $lesson): JsonResponse
    {
        $lesson->delete();

        return response()->json([
            'message' => 'Aula removida com sucesso.',
        ]);
    }

    /**
     * Upload a video for a lesson.
     */
    public function uploadVideo(Request $request, Lesson $lesson): JsonResponse
    {
        $request->validate([
            'video' => ['required', 'file', 'mimes:mp4,webm,mov,avi', 'max:512000'],
        ]);

        $file = $request->file('video');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('videos', $filename);

        $storedPath = 'videos/' . $filename;

        // Try to get duration using getID3 if available
        $duration = null;
        if (class_exists(\getID3::class)) {
            try {
                $getID3 = new \getID3();
                $fileInfo = $getID3->analyze(storage_path('app/' . $storedPath));
                $duration = isset($fileInfo['playtime_seconds'])
                    ? (int) round($fileInfo['playtime_seconds'])
                    : null;
            } catch (\Throwable $e) {
                // Silently ignore – duration stays null
            }
        }

        $lesson->update([
            'content_url'      => $storedPath,
            'video_source'     => 'local',
            'duration_seconds' => $duration,
        ]);

        return response()->json($lesson->fresh());
    }

    /**
     * Upload an ebook (PDF) for a lesson.
     */
    public function uploadEbook(Request $request, Lesson $lesson): JsonResponse
    {
        $request->validate([
            'ebook' => ['required', 'file', 'mimes:pdf', 'max:51200'],
        ]);

        $file = $request->file('ebook');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('ebooks', $filename);

        $storedPath = 'ebooks/' . $filename;
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

        $ebook = Ebook::updateOrCreate(
            ['lesson_id' => $lesson->id],
            [
                'title'           => $originalName,
                'file_path'       => $storedPath,
                'file_size_bytes' => $file->getSize(),
                'summary_status'  => 'pending',
            ]
        );

        return response()->json($ebook);
    }
}
