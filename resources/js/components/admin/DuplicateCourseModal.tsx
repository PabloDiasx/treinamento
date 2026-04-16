import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, X } from "lucide-react"
import { toast } from "sonner"
import { useDuplicateCourse } from "@/hooks/useCourses"
import { useAdminCategories } from "@/hooks/useCategories"
import type { Course, Category } from "@/types"

interface DuplicateCourseModalProps {
  course: Course | null
  onClose: () => void
}

export default function DuplicateCourseModal({ course, onClose }: DuplicateCourseModalProps) {
  const duplicateCourse = useDuplicateCourse()
  const { data: categories } = useAdminCategories()

  const [categoryId, setCategoryId] = useState<number | "">("")
  const [title, setTitle] = useState("")

  useEffect(() => {
    if (course) {
      setCategoryId(course.category_id ?? "")
      setTitle(`${course.title} (cópia)`)
    } else {
      setCategoryId("")
      setTitle("")
    }
  }, [course])

  const handleDuplicate = async () => {
    if (!course || !categoryId) return
    try {
      await duplicateCourse.mutateAsync({
        id: course.id,
        category_id: Number(categoryId),
        title: title || undefined,
      })
      toast.success("Curso duplicado com sucesso!")
      onClose()
    } catch {
      toast.error("Erro ao duplicar curso.")
    }
  }

  return (
    <AnimatePresence>
      {course && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
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
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#6d28d925" }}
                >
                  <Copy className="h-5 w-5" style={{ color: "#a78bfa" }} />
                </div>
                <h3 className="text-lg font-semibold text-white">Duplicar Curso</h3>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-5 text-sm text-gray-400">
              Duplicando <strong className="text-white">{course.title}</strong> com todos os vídeos.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Categoria de origem
                </label>
                <select
                  value={course.category_id ?? ""}
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
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleDuplicate}
                disabled={!categoryId || duplicateCourse.isPending}
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
  )
}
