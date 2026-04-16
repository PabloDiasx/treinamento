<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseVideo extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'video_url',
        'video_source',
        'video_path',
        'tag',
        'sort_order',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Detecta a origem do vídeo a partir da URL.
     * Retorna um dos valores válidos: youtube, vimeo, gdrive, external.
     */
    public static function detectSource(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        return match (true) {
            str_contains($url, 'youtube.com'), str_contains($url, 'youtu.be') => 'youtube',
            str_contains($url, 'vimeo.com')                                   => 'vimeo',
            str_contains($url, 'drive.google.com')                            => 'gdrive',
            default                                                            => 'external',
        };
    }
}
