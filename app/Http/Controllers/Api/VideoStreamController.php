<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;

class VideoStreamController extends Controller
{
    /**
     * Stream a lesson video.
     *
     * @todo Implement proper video streaming with range-request support in Phase 2.
     */
    public function stream(Lesson $lesson): JsonResponse
    {
        return response()->json([
            'message' => 'Video streaming - a ser implementado na Fase 2.',
            'lesson'  => $lesson->only(['id', 'title', 'content_url', 'video_source', 'duration_seconds']),
        ]);
    }
}
