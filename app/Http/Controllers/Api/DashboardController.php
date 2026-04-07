<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Return dashboard data for the authenticated student.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $enrolledCount = Enrollment::where('user_id', $user->id)->count();

        $completedCount = Enrollment::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();

        $lessonsCompleted = LessonProgress::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $certificateCount = Certificate::where('user_id', $user->id)->count();

        $recentEnrollments = Enrollment::where('user_id', $user->id)
            ->with('course:id,title,slug,thumbnail_path')
            ->latest('enrolled_at')
            ->take(5)
            ->get();

        $recentCourses = $recentEnrollments
            ->pluck('course')
            ->filter()
            ->values();

        // Compute an overall progress percentage
        $totalLessons = 0;
        $courseIds = Enrollment::where('user_id', $user->id)->pluck('course_id');
        if ($courseIds->isNotEmpty()) {
            $totalLessons = Lesson::whereHas('module', function ($q) use ($courseIds) {
                $q->whereIn('course_id', $courseIds);
            })->count();
        }
        $progressPct = $totalLessons > 0
            ? round(($lessonsCompleted / $totalLessons) * 100)
            : 0;

        return response()->json([
            'total_courses'     => $enrolledCount,
            'total_enrollments' => $enrolledCount,
            'completed_courses' => $completedCount,
            'progress_pct'      => $progressPct,
            'recent_courses'    => $recentCourses,
        ]);
    }

    /**
     * Return dashboard data for administrators.
     */
    public function admin(): JsonResponse
    {
        $totalUsers       = User::count();
        $totalCourses     = Course::count();
        $publishedCourses = Course::published()->count();
        $totalEnrollments = Enrollment::count();
        $totalCertificates = Certificate::count();

        $recentEnrollments = Enrollment::with([
            'user:id,name,email',
            'course:id,title,slug',
        ])
            ->latest('enrolled_at')
            ->take(10)
            ->get();

        $popularCourses = Course::published()
            ->withCount('enrollments')
            ->orderByDesc('enrollments_count')
            ->take(5)
            ->get();

        return response()->json([
            'total_users'        => $totalUsers,
            'total_courses'      => $totalCourses,
            'total_enrollments'  => $totalEnrollments,
            'total_certificates' => $totalCertificates,
            'recent_enrollments' => $recentEnrollments,
            'popular_courses'    => $popularCourses,
        ]);
    }
}
