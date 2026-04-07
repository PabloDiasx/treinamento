<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiChatMessage;
use App\Models\Ebook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    /**
     * Send a chat message and receive an AI response.
     *
     * @todo Integrate with OpenAI / LLM provider in Phase 2.
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message'      => ['required', 'string', 'max:2000'],
            'context_type' => ['nullable', 'string', 'in:course,lesson,ebook'],
            'context_id'   => ['nullable', 'integer'],
        ]);

        // Placeholder: store the user message and return a stub reply.
        $userMessage = AiChatMessage::create([
            'user_id'      => $request->user()->id,
            'context_type' => $request->input('context_type'),
            'context_id'   => $request->input('context_id'),
            'role'         => 'user',
            'content'      => $request->input('message'),
            'tokens_used'  => 0,
        ]);

        return response()->json([
            'message'  => 'Chat endpoint - integracao com IA a ser implementada na Fase 2.',
            'user_msg' => $userMessage,
            'reply'    => null,
        ]);
    }

    /**
     * Return the authenticated user's chat history.
     */
    public function history(Request $request): JsonResponse
    {
        $messages = AiChatMessage::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(30);

        return response()->json($messages);
    }

    /**
     * Request an AI-generated summary for an ebook.
     *
     * @todo Integrate with LLM provider in Phase 2.
     */
    public function summarize(Ebook $ebook): JsonResponse
    {
        return response()->json([
            'message' => 'Resumo por IA - a ser implementado na Fase 2.',
            'ebook'   => $ebook->only(['id', 'title', 'ai_summary', 'summary_status']),
        ]);
    }
}
