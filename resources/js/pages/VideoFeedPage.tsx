import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { useCourse } from "@/hooks/useCourses"
import VideoFeed from "@/components/video/VideoFeed"
import type { Lesson } from "@/types"

export default function VideoFeedPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>()
  const navigate = useNavigate()

  const { data: course, isLoading, isError } = useCourse(slug ?? "")

  // ── Flatten all lessons in module sort order ─────────────────

  const flatLessons = useMemo<Lesson[]>(() => {
    if (!course?.modules) return []

    const sorted = [...course.modules].sort((a, b) => a.sort_order - b.sort_order)

    return sorted.flatMap((mod) => {
      if (!mod.lessons) return []
      return [...mod.lessons].sort((a, b) => a.sort_order - b.sort_order)
    })
  }, [course])

  // ── Parse initial lesson ID ──────────────────────────────────

  const initialLessonId = lessonId ? Number(lessonId) : undefined

  // ── Go back to course detail ─────────────────────────────────

  const handleBack = () => {
    navigate(`/courses/${slug}`)
  }

  // ── Loading state ────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className="flex h-[100dvh] w-full items-center justify-center"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-sm text-gray-400">Carregando aulas...</p>
        </motion.div>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────

  if (isError || !course) {
    return (
      <div
        className="flex h-[100dvh] w-full items-center justify-center"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 px-6 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            Curso nao encontrado
          </h2>
          <p className="text-sm text-gray-400">
            O curso solicitado nao existe ou voce nao tem acesso.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
          >
            Voltar ao inicio
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Empty lessons state ──────────────────────────────────────

  if (flatLessons.length === 0) {
    return (
      <div
        className="flex h-[100dvh] w-full items-center justify-center"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 px-6 text-center"
        >
          <p className="text-lg font-semibold text-white">
            Nenhuma aula disponivel
          </p>
          <p className="text-sm text-gray-400">
            Este curso ainda nao possui aulas cadastradas.
          </p>
          <button
            onClick={handleBack}
            className="mt-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
          >
            Voltar ao curso
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Main feed ────────────────────────────────────────────────

  return (
    <div className="relative h-[100dvh] w-full" style={{ backgroundColor: "#0a0a0f" }}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        onClick={handleBack}
        className="absolute left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60"
        aria-label="Voltar"
      >
        <ArrowLeft className="h-5 w-5 text-white" />
      </motion.button>

      <VideoFeed
        lessons={flatLessons}
        modules={course.modules ?? []}
        initialLessonId={initialLessonId}
        courseSlug={slug ?? ""}
        courseTitle={course.title}
      />
    </div>
  )
}
