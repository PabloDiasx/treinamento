<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Return a paginated list of published courses.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Course::published()
            ->select([
                'id', 'title', 'slug', 'short_description', 'thumbnail_path',
                'status', 'difficulty', 'is_featured', 'published_at',
                'instructor_id', 'category_id', 'created_at',
            ])
            ->with(['instructor:id,name', 'category:id,name,slug,color'])
            ->withCount('enrollments');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $courses = $query->latest('published_at')->paginate(15);

        return response()->json($courses);
    }

    /**
     * Return a single course with its modules and lessons.
     */
    public function show(Course $course): JsonResponse
    {
        $course->load([
            'instructor:id,name',
            'category:id,name,slug,color',
            'videos' => fn ($q) => $q->orderBy('sort_order'),
        ]);

        return response()->json($course);
    }
}
