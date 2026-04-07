<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('context_type', 20);
            $table->unsignedBigInteger('context_id')->nullable();
            $table->string('role', 10);
            $table->text('content');
            $table->integer('tokens_used')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['user_id', 'context_type', 'context_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_chat_messages');
    }
};
