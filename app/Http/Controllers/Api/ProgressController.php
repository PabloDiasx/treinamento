<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    /**
     * Update (or create) the authenticated user's progress on a lesson.
     *
     * @todo Add completion event and certificate generation trigger in Phase 2.
     */
    public function update(Request $request, Lesson $lesson): JsonResponse
    {
        $validated = $request->validate([
            'status'        => ['sometimes', 'string', 'in:not_started,in_progress,completed'],
            'progress_pct'  => ['sometimes', 'integer', 'min:0', 'max:100'],
            'last_position' => ['sometimes', 'integer', 'min:0'],
        ]);

        $progress = LessonProgress::updateOrCreate(
            [
                'user_id'   => $request->user()->id,
                'lesson_id' => $lesson->id,
            ],
            array_merge($validated, [
                'started_at' => now(),
            ])
        );

        if (($validated['status'] ?? null) === 'completed' && ! $progress->completed_at) {
            $progress->update(['completed_at' => now()]);
        }

        return response()->json([
            'message'  => 'Progresso atualizado.',
            'progress' => $progress->fresh(),
        ]);
    }
}
