<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Return all categories with course counts.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('courses')->get();

        return response()->json($categories);
    }

    /**
     * Create a new category.
     *
     * @todo Add form request validation in Phase 2.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['required', 'string', 'max:255', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'icon'        => ['nullable', 'string', 'max:100'],
            'color'       => ['nullable', 'string', 'max:50'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    /**
     * Return a single category.
     */
    public function show(Category $category): JsonResponse
    {
        $category->loadCount('courses');

        return response()->json($category);
    }

    /**
     * Update an existing category.
     *
     * @todo Add form request validation in Phase 2.
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'slug'        => ['sometimes', 'string', 'max:255', 'unique:categories,slug,' . $category->id],
            'description' => ['nullable', 'string'],
            'icon'        => ['nullable', 'string', 'max:100'],
            'color'       => ['nullable', 'string', 'max:50'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ]);

        $category->update($validated);

        return response()->json($category->fresh());
    }

    /**
     * Delete a category.
     *
     * @todo Add check for associated courses in Phase 2.
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'message' => 'Categoria removida com sucesso.',
        ]);
    }
}
