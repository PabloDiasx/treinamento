import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Category } from "@/types"

// ── Chaves de query ─────────────────────────────────────────

export const categoryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
  admin: ["admin-categories"] as const,
  adminList: () => [...categoryKeys.admin, "list"] as const,
}

// ── Hooks publicos ──────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>("/categories")
      return data
    },
  })
}

// ── Hooks administrativos ───────────────────────────────────

export function useAdminCategories() {
  return useQuery({
    queryKey: categoryKeys.adminList(),
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>("/admin/categories")
      return data
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<Category>) => {
      const { data } = await apiClient.post<Category>(
        "/admin/categories",
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminList() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Category> & { id: number }) => {
      const { data } = await apiClient.put<Category>(
        `/admin/categories/${id}`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminList() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminList() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
    },
  })
}
