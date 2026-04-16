<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('course_videos', function (Blueprint $table) {
            // course_id tem FK (já indexado) mas ordenamos muito por sort_order — index composto
            $table->index(['course_id', 'sort_order'], 'cv_course_sort_idx');
            $table->index('tag', 'cv_tag_idx');
        });

        Schema::table('courses', function (Blueprint $table) {
            // queries de catálogo filtram por status + ordenam por published_at
            $table->index(['status', 'published_at'], 'courses_status_published_idx');
            $table->index(['category_id', 'status'], 'courses_category_status_idx');
        });

        Schema::table('news', function (Blueprint $table) {
            $table->index(['is_published', 'sort_order'], 'news_published_sort_idx');
        });
    }

    public function down(): void
    {
        Schema::table('course_videos', function (Blueprint $table) {
            $table->dropIndex('cv_course_sort_idx');
            $table->dropIndex('cv_tag_idx');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex('courses_status_published_idx');
            $table->dropIndex('courses_category_status_idx');
        });

        Schema::table('news', function (Blueprint $table) {
            $table->dropIndex('news_published_sort_idx');
        });
    }
};
