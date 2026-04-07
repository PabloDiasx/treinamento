import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Module } from "@/types"
import { courseKeys } from "./useCourses"

// ── Chaves de query ─────────────────────────────────────────

export const moduleKeys = {
  all: ["modules"] as const,
}

// ── Hooks ───────────────────────────────────────────────────

export function useCreateModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<Module> & { course_id: number }) => {
      const { course_id, ...rest } = payload
      const { data } = await apiClient.post<Module>(
        `/admin/courses/${course_id}/modules`,
        rest,
      )
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseKeys.adminDetail(variables.course_id),
      })
      queryClient.invalidateQueries({ queryKey: courseKeys.adminLists() })
    },
  })
}

export function useUpdateModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<Module> & { id: number }) => {
      const { data } = await apiClient.put<Module>(
        `/admin/modules/${id}`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.admin })
    },
  })
}

export function useDeleteModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/modules/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.admin })
    },
  })
}
