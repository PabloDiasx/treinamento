import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Star, Clock, BookOpen } from "lucide-react"
import { useCourses } from "@/hooks/useCourses"
import { useCategories } from "@/hooks/useCategories"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import type { Course, Category } from "@/types"

// ── Difficulty labels ──────────────────────────────────────────

const difficultyLabel: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediario",
  advanced: "Avancado",
}

const difficultyColor: Record<string, string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
}

// ── CourseCard (inline) ────────────────────────────────────────

function CourseCard({ course, index }: { course: Course; index: number }) {
  const catColor = course.category?.color ?? "#6d28d9"
  const totalLessons =
    course.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link to={`/courses/${course.slug}`} className="group block">
        <div
          className="relative overflow-hidden rounded-xl border border-white/5 transition-all duration-300 group-hover:scale-[1.02] group-hover:border-purple-500/40 group-hover:shadow-[0_0_24px_rgba(109,40,217,0.15)]"
          style={{ backgroundColor: "#16161d" }}
        >
          {/* Thumbnail */}
          <div className="relative h-44 w-full overflow-hidden">
            {course.thumbnail_path ? (
              <img
                src={course.thumbnail_path}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${catColor}33, ${catColor}11)`,
                }}
              />
            )}

            {/* Featured badge */}
            {course.is_featured && (
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-yellow-500/90 px-2.5 py-1 text-xs font-semibold text-black">
                <Star className="h-3 w-3" />
                Destaque
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Badges row */}
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              {course.category && (
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: catColor + "18",
                    color: catColor,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: catColor }}
                  />
                  {course.category.name}
                </span>
              )}
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor:
                    (difficultyColor[course.difficulty] ?? "#6d28d9") + "18",
                  color: difficultyColor[course.difficulty] ?? "#6d28d9",
                }}
              >
                {difficultyLabel[course.difficulty] ?? course.difficulty}
              </span>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-base font-semibold text-white line-clamp-2 leading-snug">
              {course.title}
            </h3>

            {/* Instructor */}
            {course.instructor && (
              <p className="mb-3 text-sm text-gray-400">
                {course.instructor.name}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {course.estimated_hours != null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {course.estimated_hours}h
                </span>
              )}
              {totalLessons > 0 && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {totalLessons} {totalLessons === 1 ? "aula" : "aulas"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
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
      <div className="h-44 w-full bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-white/5" />
          <div className="h-5 w-16 rounded-full bg-white/5" />
        </div>
        <div className="h-5 w-3/4 rounded bg-white/5" />
        <div className="h-4 w-1/3 rounded bg-white/5" />
        <div className="flex gap-4">
          <div className="h-4 w-12 rounded bg-white/5" />
          <div className="h-4 w-16 rounded bg-white/5" />
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────

export default function CourseCatalog() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const params = useMemo(
    () => ({
      search: search || undefined,
      category_id: selectedCategory ?? undefined,
      page,
    }),
    [search, selectedCategory, page],
  )

  const { data: coursesData, isLoading: coursesLoading } = useCourses(params)
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const courses = coursesData?.data ?? []
  const lastPage = coursesData?.last_page ?? 1

  function handleCategoryChange(catId: number | null) {
    setSelectedCategory(catId)
    setPage(1)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <AppLayout>
      <PageHeader
        title="Catalogo de Cursos"
        description="Explore nossos cursos e comece a aprender"
      />

      {/* Search bar */}
      <div className="mb-6">
        <div
          className="flex items-center gap-3 rounded-xl border border-white/5 px-4 py-3 focus-within:border-purple-500/40 transition-colors"
          style={{ backgroundColor: "#16161d" }}
        >
          <Search className="h-5 w-5 text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mb-8 -mx-1 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-1 pb-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className="flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            style={
              selectedCategory === null
                ? { backgroundColor: "#6d28d9", color: "#ffffff" }
                : { backgroundColor: "#ffffff0d", color: "#9ca3af" }
            }
          >
            Todos
          </button>
          {!categoriesLoading &&
            categories?.map((cat: Category) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                style={
                  selectedCategory === cat.id
                    ? {
                        backgroundColor: (cat.color ?? "#6d28d9") + "30",
                        color: cat.color ?? "#6d28d9",
                      }
                    : { backgroundColor: "#ffffff0d", color: "#9ca3af" }
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color ?? "#6d28d9" }}
                />
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Course grid */}
      {coursesLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Search className="mb-4 h-12 w-12 text-gray-600" />
          <h3 className="text-lg font-semibold text-white">
            Nenhum curso encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Tente ajustar os filtros ou buscar por outro termo.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: Course, i: number) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!coursesLoading && lastPage > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: lastPage }).map((_, i) => {
            const p = i + 1
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors"
                style={
                  page === p
                    ? { backgroundColor: "#6d28d9", color: "#ffffff" }
                    : { backgroundColor: "#ffffff0d", color: "#9ca3af" }
                }
              >
                {p}
              </button>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
