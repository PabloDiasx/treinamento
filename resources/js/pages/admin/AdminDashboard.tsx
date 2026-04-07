import { motion } from "framer-motion"
import {
  Users,
  BookOpen,
  CheckCircle,
  UserPlus,
  Calendar,
} from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import { useAdminDashboard } from "@/hooks/useDashboard"
import type { AdminDashboardData } from "@/types"

function StatCard({
  icon: Icon,
  value,
  label,
  delay,
}: {
  icon: React.ElementType
  value: number | string
  label: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-white/5 p-6"
      style={{ backgroundColor: "#16161d" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: "rgba(109, 40, 217, 0.15)" }}
        >
          <Icon className="h-6 w-6" style={{ color: "#6d28d9" }} />
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

function StatCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-white/5 p-6"
      style={{ backgroundColor: "#16161d" }}
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-white/5" />
        <div className="space-y-2">
          <div className="h-8 w-16 rounded bg-white/5" />
          <div className="h-4 w-24 rounded bg-white/5" />
        </div>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-white/5 p-6"
      style={{ backgroundColor: "#16161d" }}
    >
      <div className="mb-4 h-6 w-48 rounded bg-white/5" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-1/4 rounded bg-white/5" />
            <div className="h-4 w-1/4 rounded bg-white/5" />
            <div className="h-4 w-1/4 rounded bg-white/5" />
            <div className="h-4 w-1/4 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard()

  const dashboard = data as AdminDashboardData | undefined

  return (
    <AppLayout>
      <PageHeader
        title="Painel Administrativo"
        description="Visao geral da plataforma de treinamentos"
      />

      {/* Stats cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              value={dashboard?.total_users ?? 0}
              label="Total Usuarios"
              delay={0}
            />
            <StatCard
              icon={BookOpen}
              value={dashboard?.total_courses ?? 0}
              label="Total Cursos"
              delay={0.1}
            />
            <StatCard
              icon={CheckCircle}
              value={dashboard?.total_certificates ?? 0}
              label="Certificados Emitidos"
              delay={0.2}
            />
            <StatCard
              icon={UserPlus}
              value={dashboard?.total_enrollments ?? 0}
              label="Total Inscricoes"
              delay={0.3}
            />
          </>
        )}
      </div>

      {/* Recent enrollments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-8"
      >
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div
            className="rounded-xl border border-white/5 p-6"
            style={{ backgroundColor: "#16161d" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              Inscricoes Recentes
            </h2>
            {dashboard?.recent_enrollments &&
            dashboard.recent_enrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left text-gray-400">
                      <th className="pb-3 pr-4 font-medium">Aluno</th>
                      <th className="pb-3 pr-4 font-medium">Curso</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dashboard.recent_enrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td className="py-3 pr-4 text-white">
                          Aluno #{enrollment.user_id}
                        </td>
                        <td className="py-3 pr-4 text-gray-300">
                          {enrollment.course?.title ?? `Curso #${enrollment.course_id}`}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              enrollment.status === "completed"
                                ? "bg-green-500/10 text-green-400"
                                : enrollment.status === "active"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {enrollment.status === "completed"
                              ? "Concluido"
                              : enrollment.status === "active"
                                ? "Ativo"
                                : enrollment.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(enrollment.enrolled_at).toLocaleDateString("pt-BR")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhuma inscricao recente encontrada.
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Popular courses */}
      {!isLoading && dashboard?.popular_courses && dashboard.popular_courses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-8"
        >
          <div
            className="rounded-xl border border-white/5 p-6"
            style={{ backgroundColor: "#16161d" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              Cursos Populares
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboard.popular_courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg border border-white/5 p-4"
                  style={{ backgroundColor: "#0a0a0f" }}
                >
                  <h3 className="font-medium text-white">{course.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {course.short_description ?? "Sem descricao"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        course.status === "published"
                          ? "bg-green-500/10 text-green-400"
                          : course.status === "draft"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {course.status === "published"
                        ? "Publicado"
                        : course.status === "draft"
                          ? "Rascunho"
                          : "Arquivado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AppLayout>
  )
}
