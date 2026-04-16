<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

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
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

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
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

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
