import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

export interface NewsItem {
  id: number
  title: string
  content: string
  image_url: string | null
  is_published: boolean
  published_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

const keys = {
  public: ["news"] as const,
  admin: ["admin-news"] as const,
}

export function useNews() {
  return useQuery({
    queryKey: keys.public,
    queryFn: async () => {
      const { data } = await apiClient.get<NewsItem[]>("/news")
      return data
    },
  })
}

export function useAdminNews() {
  return useQuery({
    queryKey: keys.admin,
    queryFn: async () => {
      const { data } = await apiClient.get<NewsItem[]>("/admin/news")
      return data
    },
  })
}

export function useCreateNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<NewsItem>) => {
      const { data } = await apiClient.post<NewsItem>("/admin/news", payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.admin })
      qc.invalidateQueries({ queryKey: keys.public })
    },
  })
}

export function useUpdateNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<NewsItem> & { id: number }) => {
      const { data } = await apiClient.put<NewsItem>(`/admin/news/${id}`, payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.admin })
      qc.invalidateQueries({ queryKey: keys.public })
    },
  })
}

export function useDeleteNews() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/news/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.admin })
      qc.invalidateQueries({ queryKey: keys.public })
    },
  })
}
