<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ebooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('title', 191);
            $table->string('file_path', 500);
            $table->bigInteger('file_size_bytes')->nullable();
            $table->integer('page_count')->nullable();
            $table->longText('extracted_text')->nullable();
            $table->longText('ai_summary')->nullable();
            $table->string('summary_status', 20)->default('pending');
            $table->timestamp('summarized_at')->nullable();
            $table->timestamps();

            $table->index('lesson_id');
            $table->index('summary_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ebooks');
    }
};
