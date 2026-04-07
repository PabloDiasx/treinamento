<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class GDriveProxyController extends Controller
{
    public function stream(Request $request)
    {
        $request->validate([
            'id' => ['required', 'string', 'regex:/^[a-zA-Z0-9_-]+$/'],
        ]);

        $fileId = $request->input('id');
        $cacheKey = "gdrive_video_{$fileId}";

        // Busca URL final e tamanho do cache (válido por 6h)
        $meta = Cache::remember($cacheKey, 21600, function () use ($fileId) {
            $gdriveUrl = "https://drive.google.com/uc?id={$fileId}&export=download&confirm=t";

            $ch = curl_init($gdriveUrl);
            curl_setopt_array($ch, [
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS      => 10,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER         => true,
                CURLOPT_NOBODY         => true,
                CURLOPT_TIMEOUT        => 15,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_USERAGENT      => 'Mozilla/5.0',
            ]);
            curl_exec($ch);
            $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
            $fileSize = (int) curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
            curl_close($ch);

            if ($fileSize <= 0) {
                $ch = curl_init($finalUrl);
                curl_setopt_array($ch, [
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HEADER         => true,
                    CURLOPT_NOBODY         => true,
                    CURLOPT_TIMEOUT        => 10,
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_USERAGENT      => 'Mozilla/5.0',
                ]);
                curl_exec($ch);
                $fileSize = (int) curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
                curl_close($ch);
            }

            return ['url' => $finalUrl, 'size' => $fileSize];
        });

        $finalUrl = $meta['url'];
        $fileSize = $meta['size'];

        $rangeHeader = $request->header('Range');
        $start = 0;
        $end = $fileSize > 0 ? $fileSize - 1 : null;
        $statusCode = 200;
        $responseHeaders = [
            'Content-Type'  => 'video/mp4',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=86400',
        ];

        if ($rangeHeader && $fileSize > 0 && preg_match('/bytes=(\d+)-(\d*)/', $rangeHeader, $m)) {
            $start = (int) $m[1];
            $end = !empty($m[2]) ? (int) $m[2] : $fileSize - 1;
            $statusCode = 206;
            $responseHeaders['Content-Range'] = "bytes {$start}-{$end}/{$fileSize}";
            $responseHeaders['Content-Length'] = $end - $start + 1;
        } elseif ($fileSize > 0) {
            $responseHeaders['Content-Length'] = $fileSize;
        }

        return response()->stream(function () use ($finalUrl, $start, $end) {
            $curlHeaders = ['User-Agent: Mozilla/5.0'];
            if ($start > 0 || $end !== null) {
                $rangeEnd = $end !== null ? $end : '';
                $curlHeaders[] = "Range: bytes={$start}-{$rangeEnd}";
            }

            $ch = curl_init($finalUrl);
            curl_setopt_array($ch, [
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_RETURNTRANSFER => false,
                CURLOPT_HEADER         => false,
                CURLOPT_HTTPHEADER     => $curlHeaders,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_TIMEOUT        => 600,
                CURLOPT_BUFFERSIZE     => 131072,
                CURLOPT_WRITEFUNCTION  => function ($ch, $data) {
                    echo $data;
                    if (ob_get_level() > 0) ob_flush();
                    flush();
                    return strlen($data);
                },
            ]);
            curl_exec($ch);
            curl_close($ch);
        }, $statusCode, $responseHeaders);
    }
}
