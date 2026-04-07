<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    /**
     * Return the authenticated user's certificates.
     */
    public function index(Request $request): JsonResponse
    {
        $certificates = Certificate::where('user_id', $request->user()->id)
            ->with('course:id,title,slug')
            ->latest('issued_at')
            ->paginate(15);

        return response()->json($certificates);
    }

    /**
     * Download a certificate file.
     *
     * @todo Implement proper PDF generation / storage download in Phase 2.
     */
    public function download(Request $request, Certificate $certificate): JsonResponse
    {
        if ($certificate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Nao autorizado.'], 403);
        }

        // Placeholder: will use Storage::download() or PDF generation in Phase 2
        return response()->json([
            'message'     => 'Download do certificado - a ser implementado na Fase 2.',
            'certificate' => $certificate->only(['id', 'certificate_code', 'file_path', 'issued_at']),
        ]);
    }
}
