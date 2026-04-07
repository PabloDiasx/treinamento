import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { DashboardData, AdminDashboardData } from "@/types"

// ── Chaves de query ─────────────────────────────────────────

export const dashboardKeys = {
  user: ["dashboard"] as const,
  admin: ["admin-dashboard"] as const,
}

// ── Hooks ───────────────────────────────────────────────────

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.user,
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardData>("/dashboard")
      return data
    },
  })
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin,
    queryFn: async () => {
      const { data } =
        await apiClient.get<AdminDashboardData>("/admin/dashboard")
      return data
    },
  })
}
