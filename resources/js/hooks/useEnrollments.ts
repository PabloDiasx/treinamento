import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { Enrollment } from "@/types"
import { courseKeys } from "./useCourses"

// ── Chaves de query ─────────────────────────────────────────

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  myCourses: () => [...enrollmentKeys.all, "my-courses"] as const,
}

// ── Hooks ───────────────────────────────────────────────────

export function useMyCourses() {
  return useQuery({
    queryKey: enrollmentKeys.myCourses(),
    queryFn: async () => {
      const { data } = await apiClient.get<Enrollment[]>("/my-courses")
      return data
    },
  })
}

export function useEnroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (courseId: number) => {
      const { data } = await apiClient.post<Enrollment>(
        `/enrollments/${courseId}`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.myCourses() })
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.details() })
    },
  })
}

export function useDrop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (courseId: number) => {
      await apiClient.delete(`/enrollments/${courseId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.myCourses() })
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.details() })
    },
  })
}
