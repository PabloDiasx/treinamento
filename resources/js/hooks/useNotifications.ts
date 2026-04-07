import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Notification } from "@/types"

// ── Chaves de query ─────────────────────────────────────────

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
}

// ── Hooks ───────────────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Notification[]>("/notifications")
      return data
    },
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.put<Notification>(
        `/notifications/${id}/read`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() })
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await apiClient.put("/notifications/read-all")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() })
    },
  })
}
