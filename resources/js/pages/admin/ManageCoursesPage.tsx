import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  BookOpen,
} from "lucide-react"
import { toast } from "sonner"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import { useAdminCourses, useDeleteCourse, useDuplicateCourse } from "@/hooks/useCourses"
import { useAdminCategories } from "@/hooks/useCategories"
import type { Course, Category } from "@/types"

const statusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-yellow-500/10 text-yellow-400" },
  published: { label: "Publicado", className: "bg-green-500/10 text-green-400" },
  archived: { label: "Arquivado", className: "bg-gray-500/10 text-gray-400" },
}

const difficultyLabels: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediario",
  advanced: "Avancado",
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-12 w-20 rounded bg-white/5" />
          <div className="h-4 flex-1 rounded bg-white/5" />
          <div className="h-4 w-24 rounded bg-white/5" />
          <div className="h-4 w-20 rounded bg-white/5" />
          <div className="h-4 w-20 rounded bg-white/5" />
        </div>
      ))}
    </div>
  )
}

export default function ManageCoursesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [duplicateTarget, setDuplicateTarget] = useState<Course | null>(null)
  const [dupCategoryId, setDupCategoryId] = useState<number | "">("")
  const [dupTitle, setDupTitle] = useState("")

  const { data, isLoading } = useAdminCourses({
    page,
    search: search || undefined,
    status: statusFilter || undefined,
  })
  const deleteCourse = useDeleteCourse()
  const duplicateCourse = useDuplicateCourse()
  const { data: categories } = useAdminCategories()

  const courses = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const total = data?.total ?? 0

  const openDuplicate = (course: Course) => {
    setDuplicateTarget(course)
    setDupCategoryId(course.category_id ?? "")
    setDupTitle(`${course.title} (cópia)`)
  }

  const closeDuplicate = () => {
    setDuplicateTarget(null)
    setDupCategoryId("")
    setDupTitle("")
  }

  const handleDuplicate = async () => {
    if (!duplicateTarget || !dupCategoryId) return
    try {
      await duplicateCourse.mutateAsync({
        id: duplicateTarget.id,
        category_id: Number(dupCategoryId),
        title: dupTitle || undefined,
      })
      toast.success("Curso duplicado com sucesso!")
      closeDuplicate()
    } catch {
      toast.error("Erro ao duplicar curso.")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCourse.mutateAsync(deleteTarget.id)
      toast.success("Curso excluido com sucesso!")
      setDeleteTarget(null)
    } catch {
      toast.error("Erro ao excluir curso.")
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Gerenciar Cursos"
        description={`${total} curso(s) encontrado(s)`}
        action={
          <button
            onClick={() => navigate("/admin/courses/new")}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#6d28d9" }}
          >
            <Plus className="h-4 w-4" />
            Novo Curso
          </button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-purple-500"
          style={{ backgroundColor: "#16161d" }}
        >
          <option value="">Todos</option>
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl border border-white/5"
        style={{ backgroundColor: "#16161d" }}
      >
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <BookOpen className="mb-3 h-12 w-12" />
            <p className="text-lg font-medium">Nenhum curso encontrado</p>
            <p className="mt-1 text-sm">
              Tente ajustar seus filtros ou crie um novo curso.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-gray-400">
                  <th className="px-6 py-3 font-medium">Thumbnail</th>
                  <th className="px-6 py-3 font-medium">Titulo</th>
                  <th className="px-6 py-3 font-medium">Instrutor</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Dificuldade</th>
                  <th className="px-6 py-3 font-medium">Data Criacao</th>
                  <th className="px-6 py-3 font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.map((course: Course) => {
                  const status = statusLabels[course.status] ?? {
                    label: course.status,
                    className: "bg-gray-500/10 text-gray-400",
                  }
                  return (
                    <motion.tr
                      key={course.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        {course.thumbnail_path ? (
                          <img
                            src={course.thumbnail_path}
                            alt={course.title}
                            className="h-10 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-16 items-center justify-center rounded bg-white/5">
                            <BookOpen className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {course.title}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {course.instructor?.name ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {difficultyLabels[course.difficulty] ?? course.difficulty}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(course.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/courses/${course.id}/edit`)
                            }
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDuplicate(course)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-purple-300"
                            title="Duplicar"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(course)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
            <p className="text-sm text-gray-400">
              Pagina {page} de {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Proximo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Duplicate modal */}
      <AnimatePresence>
        {duplicateTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={closeDuplicate}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-white/5 p-6"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "#6d28d925" }}>
                    <Copy className="h-5 w-5" style={{ color: "#a78bfa" }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Duplicar Curso</h3>
                </div>
                <button onClick={closeDuplicate} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-5 text-sm text-gray-400">
                Duplicando <strong className="text-white">{duplicateTarget.title}</strong> com todos os vídeos.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">
                    Categoria de origem
                  </label>
                  <select
                    value={duplicateTarget.category_id ?? ""}
                    disabled
                    className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm text-gray-400 outline-none opacity-70 cursor-not-allowed"
                    style={{ backgroundColor: "#0a0a0f" }}
                  >
                    <option value="">—</option>
                    {(categories ?? []).map((c: Category) => (
                      <option key={c.id} value={c.id} style={{ backgroundColor: "#16161d" }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">
                    Categoria de destino
                  </label>
                  <select
                    value={dupCategoryId}
                    onChange={(e) => setDupCategoryId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                    style={{ backgroundColor: "#0a0a0f" }}
                  >
                    <option value="" style={{ backgroundColor: "#16161d" }}>
                      Selecione uma categoria...
                    </option>
                    {(categories ?? []).map((c: Category) => (
                      <option key={c.id} value={c.id} style={{ backgroundColor: "#16161d" }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">
                    Título do novo curso
                  </label>
                  <input
                    type="text"
                    value={dupTitle}
                    onChange={(e) => setDupTitle(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeDuplicate}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDuplicate}
                  disabled={!dupCategoryId || duplicateCourse.isPending}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#6d28d9" }}
                >
                  <Copy className="h-4 w-4" />
                  {duplicateCourse.isPending ? "Duplicando..." : "Duplicar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl border border-white/5 p-6"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    Excluir Curso
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Tem certeza que deseja excluir o curso{" "}
                    <strong className="text-white">{deleteTarget.title}</strong>?
                    Esta acao nao pode ser desfeita.
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteCourse.isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteCourse.isPending ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
