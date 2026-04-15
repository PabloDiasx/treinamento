import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { CourseVideo } from "@/types"

export const videoKeys = {
  all: (courseId: number) => ["course-videos", courseId] as const,
}

export function useCourseVideos(courseId: number) {
  return useQuery({
    queryKey: videoKeys.all(courseId),
    queryFn: async () => {
      const { data } = await apiClient.get<CourseVideo[]>(
        `/admin/courses/${courseId}/videos`,
      )
      return data
    },
    enabled: !!courseId,
  })
}

export function useCreateCourseVideo(courseId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<CourseVideo>) => {
      const { data } = await apiClient.post<CourseVideo>(
        `/admin/courses/${courseId}/videos`,
        payload,
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all(courseId) }),
  })
}

export function useUpdateCourseVideo(courseId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<CourseVideo> & { id: number }) => {
      const { data } = await apiClient.put<CourseVideo>(`/admin/videos/${id}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all(courseId) }),
  })
}

export function useReorderCourseVideos(courseId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (order: number[]) => {
      await apiClient.put(`/admin/courses/${courseId}/videos/reorder`, { order })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all(courseId) }),
  })
}

export function useDeleteCourseVideo(courseId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/videos/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: videoKeys.all(courseId) }),
  })
}
