<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar_url',
        'bio',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
        ];
    }

    // -------------------------------------------------------
    // Relationships
    // -------------------------------------------------------

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function aiChatMessages(): HasMany
    {
        return $this->hasMany(AiChatMessage::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isInstructor(): bool
    {
        return $this->role === UserRole::Instructor;
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::Student;
    }

    public function hasRole(UserRole $role): bool
    {
        return $this->role === $role;
    }
}
