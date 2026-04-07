<?php

namespace App\Models;

use App\Enums\CourseStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'category_id',
        'title',
        'slug',
        'description',
        'short_description',
        'thumbnail_path',
        'video_url',
        'video_source',
        'video_path',
        'status',
        'difficulty',
        'estimated_hours',
        'is_featured',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => CourseStatus::class,
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'estimated_hours' => 'decimal:1',
        ];
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(CourseVideo::class)->orderBy('sort_order');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class)->orderBy('sort_order');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    // -------------------------------------------------------
    // Scopes
    // -------------------------------------------------------

    public function scopePublished($query)
    {
        return $query->where('status', CourseStatus::Published);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
