<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('video_url')->nullable()->after('thumbnail_path');
            $table->string('video_source')->nullable()->after('video_url');
            $table->string('video_path')->nullable()->after('video_source');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'video_source', 'video_path']);
        });
    }
};
