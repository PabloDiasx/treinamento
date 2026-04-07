<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * Enroll the authenticated user in a course.
     *
     * @todo Add duplicate-enrollment guard and event dispatch in Phase 2.
     */
    public function enroll(Request $request, Course $course): JsonResponse
    {
        $enrollment = Enrollment::firstOrCreate([
            'user_id'  => $request->user()->id,
            'course_id' => $course->id,
        ], [
            'status'      => 'active',
            'enrolled_at' => now(),
        ]);

        return response()->json([
            'message'    => 'Inscrito com sucesso.',
            'enrollment' => $enrollment,
        ], 201);
    }

    /**
     * Drop (cancel) the authenticated user's enrollment in a course.
     *
     * @todo Implement soft-cancel logic in Phase 2.
     */
    public function drop(Request $request, Course $course): JsonResponse
    {
        $deleted = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->delete();

        if (! $deleted) {
            return response()->json([
                'message' => 'Inscricao nao encontrada.',
            ], 404);
        }

        return response()->json([
            'message' => 'Inscricao cancelada com sucesso.',
        ]);
    }

    /**
     * Return the courses the authenticated user is enrolled in.
     */
    public function myCourses(Request $request): JsonResponse
    {
        $enrollments = Enrollment::where('user_id', $request->user()->id)
            ->with([
                'course:id,instructor_id,category_id,title,slug,short_description,thumbnail_path,status,difficulty,estimated_hours',
                'course.instructor:id,name',
                'course.category:id,name,slug,color',
            ])
            ->latest('enrolled_at')
            ->get();

        return response()->json($enrollments);
    }
}
