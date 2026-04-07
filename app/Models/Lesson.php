<?php

namespace App\Models;

use App\Enums\LessonType;
use App\Enums\VideoSource;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'slug',
        'type',
        'content_url',
        'video_source',
        'content_text',
        'duration_seconds',
        'sort_order',
        'is_free_preview',
    ];

    protected function casts(): array
    {
        return [
            'type' => LessonType::class,
            'video_source' => VideoSource::class,
            'is_free_preview' => 'boolean',
        ];
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function ebook(): HasOne
    {
        return $this->hasOne(Ebook::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }
}
