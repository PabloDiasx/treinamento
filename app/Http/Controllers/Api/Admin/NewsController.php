<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNewsRequest;
use App\Http\Requests\Admin\UpdateNewsRequest;
use App\Models\News;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            News::orderBy('sort_order')->orderByDesc('created_at')->get()
        );
    }

    public function store(StoreNewsRequest $request): JsonResponse
    {
        $news = News::create($request->validated());

        return response()->json($news, 201);
    }

    public function show(News $news): JsonResponse
    {
        return response()->json($news);
    }

    public function update(UpdateNewsRequest $request, News $news): JsonResponse
    {
        $news->update($request->validated());

        return response()->json($news->fresh());
    }

    public function destroy(News $news): JsonResponse
    {
        $news->delete();

        return response()->json(['message' => 'Notícia removida.']);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:8192'],
        ]);

        $file = $request->file('image');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $dir = public_path('uploads/news');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $file->move($dir, $filename);

        return response()->json([
            'url' => '/uploads/news/' . $filename,
        ]);
    }
}
