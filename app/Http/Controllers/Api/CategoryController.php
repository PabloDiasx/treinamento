<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Return all categories (ordered by sort_order via global scope).
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('courses')->get();

        return response()->json($categories);
    }
}
