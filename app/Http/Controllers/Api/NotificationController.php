<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Return the authenticated user's notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        // Ensure the notification belongs to the authenticated user.
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Nao autorizado.'], 403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'message'      => 'Notificacao marcada como lida.',
            'notification' => $notification->fresh(),
        ]);
    }

    /**
     * Mark all of the authenticated user's notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Todas as notificacoes foram marcadas como lidas.',
        ]);
    }
}
