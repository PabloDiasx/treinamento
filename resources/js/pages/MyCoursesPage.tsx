import { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
} from "lucide-react"
import { useMyCourses } from "@/hooks/useEnrollments"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import type { Enrollment } from "@/types"

// ── Tab type ───────────────────────────────────────────────────

type TabFilter = "all" | "in_progress" | "completed"

const tabs: { key: TabFilter; label: string }[] = [
  { key: "in_progress", label: "Em Andamento" },
  { key: "completed", label: "Concluidos" },
  { key: "all", label: "Todos" },
]

// ── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ── Enrollment card ────────────────────────────────────────────

function EnrollmentCard({
  enrollment,
  index,
}: {
  enrollment: Enrollment
  index: number
}) {
  const navigate = useNavigate()
  const course = enrollment.course
  const isCompleted = enrollment.status === "completed"
  const catColor = course?.category?.color ?? "#6d28d9"

  // Calculate a progress percentage from status (since there is no progress_pct on Enrollment)
  const progressPct = isCompleted ? 100 : 0

  function handleContinue() {
    if (!course) return
    navigate(`/courses/${course.slug}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-white/5 transition-all duration-300 hover:border-white/10"
      style={{ backgroundColor: "#16161d" }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative h-44 w-full sm:h-auto sm:w-52 flex-shrink-0">
          {course?.thumbnail_path ? (
            <img
              src={course.thumbnail_path}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full min-h-[120px]"
              style={{
                background: `linear-gradient(135deg, ${catColor}33, ${catColor}11)`,
              }}
            />
          )}
          {isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            {/* Title */}
            <h3 className="mb-1 text-base font-semibold text-white line-clamp-2">
              {course?.title ?? "Curso"}
            </h3>

            {/* Instructor */}
            {course?.instructor && (
              <p className="mb-3 text-sm text-gray-400">
                {course.instructor.name}
              </p>
            )}

            {/* Progress bar */}
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-400">Progresso</span>
                <span className="text-xs font-medium text-white">
                  {progressPct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: isCompleted ? "#10b981" : "#6d28d9",
                  }}
                />
              </div>
            </div>

            {/* Enrolled date */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              Inscrito em {formatDate(enrollment.enrolled_at)}
            </div>
          </div>

          {/* Action */}
          <div className="mt-4">
            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{
                backgroundColor: isCompleted ? "#ffffff0d" : "#6d28d9",
              }}
            >
              {isCompleted ? "Rever Curso" : "Continuar"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Skeleton card ──────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-xl border border-white/5"
      style={{ backgroundColor: "#16161d" }}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="h-44 w-full bg-white/5 sm:h-auto sm:w-52" />
        <div className="flex-1 p-5 space-y-3">
          <div className="h-5 w-3/4 rounded bg-white/5" />
          <div className="h-4 w-1/3 rounded bg-white/5" />
          <div className="h-2 w-full rounded-full bg-white/5" />
          <div className="h-4 w-1/4 rounded bg-white/5" />
          <div className="h-9 w-28 rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("in_progress")
  const { data: enrollments, isLoading } = useMyCourses()

  const filtered = useMemo(() => {
    if (!enrollments) return []
    switch (activeTab) {
      case "in_progress":
        return enrollments.filter(
          (e: Enrollment) => e.status !== "completed",
        )
      case "completed":
        return enrollments.filter(
          (e: Enrollment) => e.status === "completed",
        )
      default:
        return enrollments
    }
  }, [enrollments, activeTab])

  return (
    <AppLayout>
      <PageHeader title="Meus Cursos" />

      {/* Tab filters */}
      <div className="mb-8 flex gap-1 rounded-xl p-1" style={{ backgroundColor: "#16161d" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={
              activeTab === tab.key
                ? { backgroundColor: "#6d28d9", color: "#ffffff" }
                : { color: "#9ca3af" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "#6d28d915" }}
          >
            <BookOpen className="h-8 w-8" style={{ color: "#6d28d9" }} />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {activeTab === "completed"
              ? "Nenhum curso concluido ainda."
              : activeTab === "in_progress"
                ? "Nenhum curso em andamento."
                : "Voce ainda nao esta inscrito em nenhum curso."}
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Explore nosso catalogo e comece a aprender agora mesmo.
          </p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#6d28d9" }}
          >
            <Search className="h-4 w-4" />
            Explorar Catalogo
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {filtered.map((enrollment: Enrollment, i: number) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </AppLayout>
  )
}
