<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->string('title', 191);
            $table->string('slug', 191);
            $table->string('type', 20)->comment('video, ebook, text, quiz');
            $table->string('content_url', 1000)->nullable();
            $table->string('video_source', 20)->nullable()->comment('local, youtube, vimeo, external');
            $table->longText('content_text')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_free_preview')->default(false);
            $table->timestamps();

            $table->index(['module_id', 'sort_order']);
            $table->unique(['module_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
