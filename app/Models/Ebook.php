<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ebook extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'file_path',
        'file_size_bytes',
        'page_count',
        'extracted_text',
        'ai_summary',
        'summary_status',
        'summarized_at',
    ];

    protected function casts(): array
    {
        return [
            'summarized_at' => 'datetime',
        ];
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
