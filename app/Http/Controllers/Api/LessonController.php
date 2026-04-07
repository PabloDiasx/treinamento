<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;

class LessonController extends Controller
{
    /**
     * Return detailed information for a single lesson.
     */
    public function show(Lesson $lesson): JsonResponse
    {
        $lesson->load(['module:id,course_id,title', 'ebook']);

        return response()->json($lesson);
    }
}
