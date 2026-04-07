import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown, BookOpen } from "lucide-react"
import { apiClient } from "@/lib/api"
import VerticalVideoPlayer from "./VerticalVideoPlayer"
import type { Lesson, Module } from "@/types"

// ── Props ──────────────────────────────────────────────────────

interface VideoFeedProps {
  lessons: Lesson[]
  modules: Module[]
  initialLessonId?: number
  courseSlug: string
  courseTitle: string
}

// ── Component ──────────────────────────────────────────────────

export default function VideoFeed({
  lessons,
  modules,
  initialLessonId,
  courseSlug: _courseSlug,
  courseTitle,
}: VideoFeedProps) {
  void _courseSlug
  // ── Determine initial index ──────────────────────────────────

  const initialIndex = useMemo(() => {
    if (!initialLessonId) return 0
    const idx = lessons.findIndex((l) => l.id === initialLessonId)
    return idx >= 0 ? idx : 0
  }, [lessons, initialLessonId])

  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [showSwipeHint, setShowSwipeHint] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Map lesson -> module name ────────────────────────────────

  const lessonModuleMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const mod of modules) {
      if (mod.lessons) {
        for (const l of mod.lessons) {
          map.set(l.id, mod.title)
        }
      }
    }
    return map
  }, [modules])

  // ── Scroll to initial lesson on mount ────────────────────────

  useEffect(() => {
    const container = containerRef.current
    const target = slideRefs.current[initialIndex]
    if (container && target) {
      // instant scroll to the starting lesson
      target.scrollIntoView({ behavior: "instant" as ScrollBehavior })
    }
  }, [initialIndex])

  // ── IntersectionObserver to track active slide ───────────────

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx >= 0) {
              setCurrentIndex(idx)
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      },
    )

    for (const ref of slideRefs.current) {
      if (ref) observer.observe(ref)
    }

    return () => observer.disconnect()
  }, [lessons.length])

  // ── Progress tracking every 15s ──────────────────────────────

  useEffect(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }

    const lesson = lessons[currentIndex]
    if (!lesson) return

    progressTimerRef.current = setInterval(() => {
      apiClient
        .put(`/lessons/${lesson.id}/progress`, {
          progress_pct: 0, // actual percentage will come from the player
        })
        .catch(() => {
          // silent fail for progress updates
        })
    }, 15_000)

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }
  }, [currentIndex, lessons])

  // ── Progress update handler from player ──────────────────────

  const handleProgressUpdate = useCallback(
    (lessonId: number) => (pct: number) => {
      apiClient
        .put(`/lessons/${lessonId}/progress`, { progress_pct: pct })
        .catch(() => {})
    },
    [],
  )

  // ── Dismiss swipe hint ───────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  // ── Navigate to specific slide ───────────────────────────────

  const scrollToIndex = useCallback((idx: number) => {
    const target = slideRefs.current[idx]
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  // ── Current lesson ───────────────────────────────────────────

  const currentLesson = lessons[currentIndex]

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden" style={{ backgroundColor: "#0a0a0f" }}>
      {/* ── Main feed area ──────────────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center">
        {/* Desktop: constrained width for 9:16 */}
        <div className="relative h-full w-full md:mx-auto md:max-w-[420px]">
          {/* Top bar: module/lesson info */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-40 px-14 pt-4 text-center"
          >
            <p className="truncate text-xs font-medium text-white/50">
              {courseTitle}
            </p>
            {currentLesson && (
              <p className="mt-0.5 truncate text-[11px] text-white/30">
                {lessonModuleMap.get(currentLesson.id) ?? ""} &bull; {currentIndex + 1}/{lessons.length}
              </p>
            )}
          </motion.div>

          {/* Scrollable container */}
          <div
            ref={containerRef}
            className="h-full w-full snap-y snap-mandatory overflow-y-scroll scrollbar-none"
            style={{ scrollSnapType: "y mandatory" }}
          >
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                ref={(el) => {
                  slideRefs.current[idx] = el
                }}
                className="h-[100dvh] w-full snap-start snap-always"
                style={{ scrollSnapAlign: "start" }}
              >
                <VerticalVideoPlayer
                  lesson={lesson}
                  isActive={idx === currentIndex}
                  moduleName={lessonModuleMap.get(lesson.id)}
                  onProgressUpdate={handleProgressUpdate(lesson.id)}
                />
              </div>
            ))}
          </div>

          {/* ── Position indicator dots (right edge) ──────────────── */}
          <div className="pointer-events-none absolute right-1.5 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-1">
            {lessons.map((_, idx) => (
              <motion.div
                key={idx}
                className="rounded-full"
                animate={{
                  height: idx === currentIndex ? 16 : 4,
                  width: 4,
                  backgroundColor:
                    idx === currentIndex ? "#a855f7" : "rgba(255,255,255,0.2)",
                }}
                transition={{ duration: 0.25 }}
              />
            ))}
          </div>

          {/* ── Swipe hint animation ──────────────────────────────── */}
          <AnimatePresence>
            {showSwipeHint && lessons.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="pointer-events-none absolute inset-x-0 bottom-16 z-40 flex flex-col items-center gap-1"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                >
                  <ChevronUp className="h-6 w-6 text-white/50" />
                </motion.div>
                <span className="text-xs text-white/40">Deslize para navegar</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Desktop sidebar (lesson list) ───────────────────────── */}
      <div className="hidden lg:flex">
        {/* Toggle button */}
        <button
          onClick={() => setShowSidebar((v) => !v)}
          className="flex h-full w-10 items-center justify-center border-l border-white/5 transition-colors hover:bg-white/5"
          style={{ backgroundColor: "#111118" }}
          aria-label="Abrir lista de aulas"
        >
          <BookOpen className="h-4 w-4 text-gray-400" />
        </button>

        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full overflow-hidden border-l border-white/5"
              style={{ backgroundColor: "#111118" }}
            >
              <div className="flex h-full w-[320px] flex-col">
                {/* Sidebar header */}
                <div className="border-b border-white/5 px-4 py-4">
                  <h2 className="text-sm font-semibold text-white">{courseTitle}</h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {lessons.length} aulas
                  </p>
                </div>

                {/* Lesson list */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                  {modules.map((mod) => (
                    <div key={mod.id}>
                      <div className="sticky top-0 border-b border-white/5 px-4 py-2" style={{ backgroundColor: "#111118" }}>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                          {mod.title}
                        </p>
                      </div>
                      {mod.lessons?.map((lesson) => {
                        const globalIdx = lessons.findIndex((l) => l.id === lesson.id)
                        const isCurrent = globalIdx === currentIndex

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => scrollToIndex(globalIdx)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                              isCurrent
                                ? "bg-purple-500/10 border-l-2 border-purple-500"
                                : "hover:bg-white/5 border-l-2 border-transparent"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                isCurrent
                                  ? "bg-purple-500 text-white"
                                  : "bg-white/10 text-gray-400"
                              }`}
                            >
                              {globalIdx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-sm ${
                                  isCurrent ? "font-semibold text-white" : "text-gray-300"
                                }`}
                              >
                                {lesson.title}
                              </p>
                              {lesson.duration_seconds && (
                                <p className="text-[11px] text-gray-500">
                                  {Math.ceil(lesson.duration_seconds / 60)} min
                                </p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile: bottom navigation arrows ────────────────────── */}
      <div className="absolute bottom-4 left-4 z-40 flex flex-col gap-2 md:hidden">
        {currentIndex > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollToIndex(currentIndex - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
            aria-label="Aula anterior"
          >
            <ChevronUp className="h-5 w-5 text-white" />
          </motion.button>
        )}
        {currentIndex < lessons.length - 1 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollToIndex(currentIndex + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
            aria-label="Proxima aula"
          >
            <ChevronDown className="h-5 w-5 text-white" />
          </motion.button>
        )}
      </div>
    </div>
  )
}
