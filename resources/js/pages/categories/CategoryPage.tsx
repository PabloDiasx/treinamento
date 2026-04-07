import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FolderOpen, Clock, BookOpen, Play } from "lucide-react"
import { useCourses } from "@/hooks/useCourses"
import { useCategories } from "@/hooks/useCategories"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import type { Course, Category } from "@/types"

interface CategoryPageProps {
  title: string
  description: string
  categorySlug: string
  icon?: React.ElementType
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const totalLessons =
    course.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/courses/${course.slug}`} className="group block">
        <div
          className="overflow-hidden rounded-xl border border-white/5 transition-all duration-300 group-hover:border-purple-500/30 group-hover:shadow-[0_0_20px_rgba(109,40,217,0.1)]"
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
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-900/10">
                <Play className="h-10 w-10 text-purple-400/40" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="mb-2 text-base font-semibold text-white line-clamp-2 leading-snug">
              {course.title}
            </h3>

            {course.short_description && (
              <p className="mb-3 text-sm text-gray-400 line-clamp-2">
                {course.short_description}
              </p>
            )}


            <div className="flex items-center gap-4 text-xs text-gray-500">
              {course.estimated_hours != null && course.estimated_hours > 0 && (
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

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-xl border border-white/5"
      style={{ backgroundColor: "#16161d" }}
    >
      <div className="h-44 w-full bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded bg-white/5" />
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-3 w-1/3 rounded bg-white/5" />
      </div>
    </div>
  )
}

export default function CategoryPage({
  title,
  description,
  categorySlug,
  icon: Icon = FolderOpen,
}: CategoryPageProps) {
  const { data: categories } = useCategories()
  const category = (categories ?? []).find(
    (c: Category) => c.slug === categorySlug,
  )

  const { data: coursesData, isLoading } = useCourses(
    category ? { category_id: category.id } : undefined,
  )

  const courses = coursesData?.data ?? []

  return (
    <AppLayout>
      <PageHeader title={title} description={description} />

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center rounded-xl border border-white/5 py-20"
          style={{ backgroundColor: "#16161d" }}
        >
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "#6d28d915" }}
          >
            <Icon className="h-8 w-8" style={{ color: "#6d28d9" }} />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Nenhum conteúdo ainda
          </h3>
          <p className="mt-2 max-w-md text-center text-sm text-gray-400">
            Os conteúdos de {title} serão adicionados em breve.
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
    </AppLayout>
  )
}
