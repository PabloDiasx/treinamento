<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Return all categories (ordered by sort_order via global scope).
     * Cached 30min — invalidado quando admin cria/edita/remove categoria.
     */
    public function index(): JsonResponse
    {
        $categories = Cache::remember('categories:public', 1800, function () {
            return Category::select('id', 'name', 'slug', 'description', 'icon', 'color', 'sort_order')
                ->withCount('courses')
                ->get();
        });

        return response()->json($categories);
    }
}
