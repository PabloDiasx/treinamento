<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseVideo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseVideoController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        return response()->json($course->videos()->orderBy('sort_order')->get());
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'video_url'    => ['nullable', 'string', 'max:500'],
            'video_source' => ['nullable', 'string', 'in:youtube,vimeo,gdrive,local,external'],
            'tag'          => ['nullable', 'string', 'in:todos,forca,hit,cardio,alongamento,sport'],
            'sort_order'   => ['nullable', 'integer', 'min:0'],
        ]);

        // Auto-detect source from URL
        if (!empty($validated['video_url']) && empty($validated['video_source'])) {
            $url = $validated['video_url'];
            if (str_contains($url, 'youtube.com') || str_contains($url, 'youtu.be')) {
                $validated['video_source'] = 'youtube';
            } elseif (str_contains($url, 'vimeo.com')) {
                $validated['video_source'] = 'vimeo';
            } elseif (str_contains($url, 'drive.google.com')) {
                $validated['video_source'] = 'gdrive';
            } else {
                $validated['video_source'] = 'external';
            }
        }

        $validated['course_id'] = $course->id;
        $validated['tag'] = $validated['tag'] ?? 'todos';
        $validated['sort_order'] = $validated['sort_order'] ?? $course->videos()->count();

        $video = CourseVideo::create($validated);

        return response()->json($video, 201);
    }

    public function update(Request $request, CourseVideo $video): JsonResponse
    {
        $validated = $request->validate([
            'title'        => ['sometimes', 'string', 'max:255'],
            'video_url'    => ['nullable', 'string', 'max:500'],
            'video_source' => ['nullable', 'string', 'in:youtube,vimeo,gdrive,local,external'],
            'tag'          => ['nullable', 'string', 'in:todos,forca,hit,cardio,alongamento,sport'],
            'sort_order'   => ['nullable', 'integer', 'min:0'],
        ]);

        if (!empty($validated['video_url']) && empty($validated['video_source'])) {
            $url = $validated['video_url'];
            if (str_contains($url, 'youtube.com') || str_contains($url, 'youtu.be')) {
                $validated['video_source'] = 'youtube';
            } elseif (str_contains($url, 'vimeo.com')) {
                $validated['video_source'] = 'vimeo';
            } elseif (str_contains($url, 'drive.google.com')) {
                $validated['video_source'] = 'gdrive';
            } else {
                $validated['video_source'] = 'external';
            }
        }

        $video->update($validated);

        return response()->json($video->fresh());
    }

    public function destroy(CourseVideo $video): JsonResponse
    {
        $video->delete();

        return response()->json(['message' => 'Vídeo removido.']);
    }

    public function uploadFile(Request $request, CourseVideo $video): JsonResponse
    {
        $request->validate([
            'video' => ['required', 'file', 'mimes:mp4,webm,mov,avi', 'max:512000'],
        ]);

        $file = $request->file('video');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('videos', $filename);

        $video->update([
            'video_path'   => 'videos/' . $filename,
            'video_source' => 'local',
            'video_url'    => null,
        ]);

        return response()->json($video->fresh());
    }
}
