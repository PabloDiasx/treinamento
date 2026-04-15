<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            News::orderBy('sort_order')->orderByDesc('created_at')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'content'      => ['required', 'string'],
            'image_url'    => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'sort_order'   => ['nullable', 'integer', 'min:0'],
        ]);

        $news = News::create($validated);

        return response()->json($news, 201);
    }

    public function show(News $news): JsonResponse
    {
        return response()->json($news);
    }

    public function update(Request $request, News $news): JsonResponse
    {
        $validated = $request->validate([
            'title'        => ['sometimes', 'string', 'max:255'],
            'content'      => ['sometimes', 'string'],
            'image_url'    => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'sort_order'   => ['nullable', 'integer', 'min:0'],
        ]);

        $news->update($validated);

        return response()->json($news->fresh());
    }

    public function destroy(News $news): JsonResponse
    {
        $news->delete();

        return response()->json(['message' => 'Notícia removida.']);
    }
}
