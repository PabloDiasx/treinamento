<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class NewsController extends Controller
{
    public function index(): JsonResponse
    {
        $news = Cache::remember('news:public', 600, function () {
            return News::where('is_published', true)
                ->orderBy('sort_order')
                ->orderByDesc('created_at')
                ->get();
        });

        return response()->json($news);
    }
}
