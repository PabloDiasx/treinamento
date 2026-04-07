<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /**
     * Return all modules for a given course.
     */
    public function index(Course $course): JsonResponse
    {
        $modules = $course->modules()->withCount('lessons')->get();

        return response()->json($modules);
    }

    /**
     * Create a new module inside a course.
     *
     * @todo Add form request validation in Phase 2.
     */
    public function store(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['course_id'] = $course->id;

        $module = Module::create($validated);

        return response()->json($module, 201);
    }

    /**
     * Return a single module with its lessons.
     */
    public function show(Module $module): JsonResponse
    {
        $module->load('lessons');

        return response()->json($module);
    }

    /**
     * Update an existing module.
     *
     * @todo Add form request validation in Phase 2.
     */
    public function update(Request $request, Module $module): JsonResponse
    {
        $validated = $request->validate([
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ]);

        $module->update($validated);

        return response()->json($module->fresh());
    }

    /**
     * Delete a module.
     *
     * @todo Add cascade / reorder logic in Phase 2.
     */
    public function destroy(Module $module): JsonResponse
    {
        $module->delete();

        return response()->json([
            'message' => 'Modulo removido com sucesso.',
        ]);
    }
}
