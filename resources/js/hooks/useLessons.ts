import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Lesson } from "@/types"
import { courseKeys } from "./useCourses"

// ── Chaves de query ─────────────────────────────────────────

export const lessonKeys = {
  all: ["lessons"] as const,
}

// ── Hooks ───────────────────────────────────────────────────

export function useCreateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<Lesson> & { module_id: number }) => {
      const { module_id, ...rest } = payload
      const { data } = await apiClient.post<Lesson>(
        `/admin/modules/${module_id}/lessons`,
        rest,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.admin })
    },
  })
}

export function useUpdateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<Lesson> & { id: number }) => {
      const { data } = await apiClient.put<Lesson>(
        `/admin/lessons/${id}`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.admin })
    },
  })
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/lessons/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.admin })
    },
  })
}

export function useUploadVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ lessonId, file }: { lessonId: number; file: File }) => {
      const formData = new FormData()
      formData.append("video", file)

      const { data } = await apiClient.post<Lesson>(
        `/admin/lessons/${lessonId}/upload-video`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.admin })
    },
  })
}

export function useUploadEbook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ lessonId, file }: { lessonId: number; file: File }) => {
      const formData = new FormData()
      formData.append("ebook", file)

      const { data } = await apiClient.post<Lesson>(
        `/admin/lessons/${lessonId}/upload-ebook`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.admin })
    },
  })
}
