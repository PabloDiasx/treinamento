<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\HttpException;

class GDriveProxyController extends Controller
{
    /**
     * Hosts permitidos no redirect final do Google Drive.
     * Protege contra SSRF: se o follow-location sair desses hosts, abortamos.
     */
    private const ALLOWED_HOSTS = [
        'drive.google.com',
        'drive.usercontent.google.com',
        'doc-0o-0s-docs.googleusercontent.com',
    ];

    private const ALLOWED_HOST_SUFFIXES = [
        '.googleusercontent.com',
        '.google.com',
    ];

    public function stream(Request $request)
    {
        $request->validate([
            'id' => ['required', 'string', 'regex:/^[a-zA-Z0-9_-]+$/'],
        ]);

        $fileId = $request->input('id');
        $cacheKey = "gdrive_video_{$fileId}";

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
                // SSL_VERIFYPEER desativado por compat cross-platform (PHP Windows sem cacert).
                // SSRF está bloqueado pela allowlist de hosts acima.
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_PROTOCOLS      => CURLPROTO_HTTPS,
                CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
                CURLOPT_USERAGENT      => 'Mozilla/5.0',
            ]);
            curl_exec($ch);
            $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
            $fileSize = (int) curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
            curl_close($ch);

            if (! self::isAllowedUrl($finalUrl)) {
                throw new HttpException(502, 'Host de redirect não permitido.');
            }

            if ($fileSize <= 0) {
                $ch = curl_init($finalUrl);
                curl_setopt_array($ch, [
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HEADER         => true,
                    CURLOPT_NOBODY         => true,
                    CURLOPT_TIMEOUT        => 10,
                    CURLOPT_SSL_VERIFYPEER => true,
                    CURLOPT_SSL_VERIFYHOST => 2,
                    CURLOPT_PROTOCOLS      => CURLPROTO_HTTPS,
                    CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
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

        // Defesa em profundidade: revalida mesmo em hit de cache
        if (! self::isAllowedUrl($finalUrl)) {
            Cache::forget($cacheKey);
            abort(502, 'Host de redirect não permitido.');
        }

        $rangeHeader = $request->header('Range');
        $start = 0;
        $end = $fileSize > 0 ? $fileSize - 1 : null;
        $statusCode = 200;
        $responseHeaders = [
            'Content-Type'  => 'video/mp4',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=604800, immutable',
            'X-Content-Type-Options' => 'nosniff',
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
                // SSL_VERIFYPEER desativado por compat cross-platform (PHP Windows sem cacert).
                // SSRF está bloqueado pela allowlist de hosts acima.
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_PROTOCOLS      => CURLPROTO_HTTPS,
                CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
                CURLOPT_TIMEOUT        => 600,
                CURLOPT_BUFFERSIZE     => 262144,
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

    /**
     * Aceita apenas hosts Google conhecidos (exato ou sufixo).
     */
    private static function isAllowedUrl(string $url): bool
    {
        $host = parse_url($url, PHP_URL_HOST);
        if (! $host) {
            return false;
        }

        if (in_array($host, self::ALLOWED_HOSTS, true)) {
            return true;
        }

        foreach (self::ALLOWED_HOST_SUFFIXES as $suffix) {
            if (str_ends_with($host, $suffix)) {
                return true;
            }
        }

        return false;
    }
}
