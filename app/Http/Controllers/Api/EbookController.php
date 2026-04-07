<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ebook;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EbookController extends Controller
{
    /**
     * Return ebook details.
     */
    public function show(Ebook $ebook): JsonResponse
    {
        $ebook->load('lesson:id,module_id,title,slug');

        return response()->json([
            'ebook' => $ebook,
        ]);
    }

    /**
     * Stream / download the ebook file.
     *
     * @todo Implement proper storage download with access control in Phase 2.
     */
    public function download(Ebook $ebook): JsonResponse|StreamedResponse
    {
        if (! $ebook->file_path) {
            return response()->json([
                'message' => 'Arquivo nao disponivel.',
            ], 404);
        }

        // Placeholder: will use Storage::download() in Phase 2
        return response()->json([
            'message' => 'Download endpoint - a ser implementado na Fase 2.',
            'ebook'   => $ebook->only(['id', 'title', 'file_path']),
        ]);
    }
}
