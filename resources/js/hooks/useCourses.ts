import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type {
  Course,
  PaginatedResponse,
  CourseFilters,
  AdminCourseFilters,
} from "@/types"

// ── Chaves de query ─────────────────────────────────────────

export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (params?: CourseFilters) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (slug: string) => [...courseKeys.details(), slug] as const,
  admin: ["admin-courses"] as const,
  adminLists: () => [...courseKeys.admin, "list"] as const,
  adminList: (params?: AdminCourseFilters) =>
    [...courseKeys.adminLists(), params] as const,
  adminDetails: () => [...courseKeys.admin, "detail"] as const,
  adminDetail: (id: number) => [...courseKeys.adminDetails(), id] as const,
}

// ── Hooks publicos ──────────────────────────────────────────

export function useCourses(params?: CourseFilters) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Course>>(
        "/courses",
        { params },
      )
      return data
    },
  })
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: courseKeys.detail(slug),
    queryFn: async () => {
      const { data } = await apiClient.get<Course>(`/courses/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}

// ── Hooks administrativos ───────────────────────────────────

export function useAdminCourses(params?: AdminCourseFilters) {
  return useQuery({
    queryKey: courseKeys.adminList(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Course>>(
        "/admin/courses",
        { params },
      )
      return data
    },
  })
}

export function useAdminCourse(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: courseKeys.adminDetail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Course>(`/admin/courses/${id}`)
      return data
    },
    enabled: options?.enabled ?? !!id,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<Course> | FormData) => {
      const { data } = await apiClient.post<Course>("/admin/courses", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.adminLists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Course> | FormData }) => {
      const { data } = await apiClient.put<Course>(
        `/admin/courses/${id}`,
        payload,
      )
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.adminDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: courseKeys.adminLists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.details() })
    },
  })
}

export function useDuplicateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, category_id, title }: { id: number; category_id: number; title?: string }) => {
      const { data } = await apiClient.post<Course>(`/admin/courses/${id}/duplicate`, {
        category_id,
        title,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.adminLists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/courses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.adminLists() })
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    },
  })
}
