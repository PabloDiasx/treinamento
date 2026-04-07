import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { User, PaginatedResponse, UserFilters } from "@/types"

// ── Chaves de query ─────────────────────────────────────────

export const userKeys = {
  all: ["admin-users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: UserFilters) => [...userKeys.lists(), params] as const,
}

// ── Hooks administrativos ───────────────────────────────────

export function useAdminUsers(params?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<User>>(
        "/admin/users",
        { params },
      )
      return data
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<User> & { password?: string }) => {
      const { data } = await apiClient.post<User>("/admin/users", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<User> & { id: number; password?: string }) => {
      const { data } = await apiClient.put<User>(
        `/admin/users/${id}`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
