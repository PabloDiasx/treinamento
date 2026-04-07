<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'sort_order',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('ordered', function ($query) {
            $query->orderBy('sort_order');
        });
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }
}
