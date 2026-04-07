<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title', 191);
            $table->string('slug', 191)->unique();
            $table->text('description')->nullable();
            $table->string('short_description', 500)->nullable();
            $table->string('thumbnail_path', 500)->nullable();
            $table->string('status', 20)->default('draft');
            $table->string('difficulty', 20)->default('beginner');
            $table->decimal('estimated_hours', 5, 1)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('instructor_id');
            $table->index('category_id');
            $table->index('status');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
