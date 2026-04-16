import { useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronLeft, ChevronRight, Play, X } from "lucide-react"
import { useCourse } from "@/hooks/useCourses"
import AppLayout from "@/components/layout/AppLayout"
import type { CourseVideo } from "@/types"

const tags = [
  { key: "todos", label: "Todos" },
  { key: "forca", label: "Força" },
  { key: "hit", label: "Hit" },
  { key: "cardio", label: "Cardio" },
  { key: "alongamento", label: "Alongamento" },
  { key: "sport", label: "Sport" },
]

interface EmbedInfo {
  type: "iframe" | "video"
  url: string
}

function getEmbedInfo(url: string): EmbedInfo | null {
  // YouTube
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (match) return { type: "iframe", url: `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` }
  // Vimeo
  match = url.match(/vimeo\.com\/(\d+)/)
  if (match) return { type: "iframe", url: `https://player.vimeo.com/video/${match[1]}?autoplay=1` }
  // Google Drive — proxy pelo backend para evitar CORS
  match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return { type: "video", url: `${import.meta.env.VITE_API_BASE || ""}/api/gdrive-stream?id=${match[1]}` }
  return null
}

function VideoCard({
  video,
  index,
  onPlay,
}: {
  video: CourseVideo
  index: number
  onPlay: (v: CourseVideo) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <button
        onClick={() => onPlay(video)}
        className="group w-full text-left overflow-hidden rounded-xl border border-white/5 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(109,40,217,0.1)]"
        style={{ backgroundColor: "#16161d" }}
      >
        {/* Thumbnail / Play icon */}
        <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-purple-500/15 to-purple-900/5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 text-white ml-0.5" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-white line-clamp-2">
            {video.title}
          </h3>
          <span className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide" style={{ backgroundColor: "#6d28d915", color: "#a78bfa" }}>
            {tags.find((t) => t.key === video.tag)?.label ?? video.tag}
          </span>
        </div>
      </button>
    </motion.div>
  )
}

function VideoModal({
  video,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  total,
  playlist,
  onSelect,
}: {
  video: CourseVideo
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  total: number
  playlist: CourseVideo[]
  onSelect: (v: CourseVideo) => void
}) {
  const embed = video.video_url ? getEmbedInfo(video.video_url) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
      style={{ backgroundColor: "#0a0a10" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full flex-col"
        style={{ backgroundColor: "#0f0f17" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4" style={{ backgroundColor: "#16161d" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "#6d28d925" }}>
              <Play className="h-4 w-4" style={{ color: "#a78bfa" }} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white">{video.title}</h3>
              <span className="text-xs text-gray-500">
                {tags.find((t) => t.key === video.tag)?.label ?? video.tag}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Player + Playlist */}
        <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
          <div className="flex flex-1 items-center justify-center p-4 lg:p-8" style={{ backgroundColor: "#000" }}>
            {embed?.type === "iframe" ? (
              <iframe
                key={video.id}
                src={embed.url}
                className="h-full w-full max-h-full max-w-full"
                style={{ aspectRatio: "16 / 9" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : embed?.type === "video" ? (
              <video
                key={video.id}
                controls
                autoPlay
                preload="metadata"
                playsInline
                className="h-full w-full max-h-full max-w-full"
                style={{ backgroundColor: "#000" }}
              >
                <source src={embed.url} type="video/mp4" />
                Seu navegador não suporta o player de vídeo.
              </video>
            ) : (
              <p className="text-gray-400">Vídeo não disponível</p>
            )}
          </div>

          {/* Playlist lateral */}
          <div
            className="flex flex-col border-t border-white/10 lg:w-96 lg:border-l lg:border-t-0"
            style={{ backgroundColor: "#0b0b12" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Playlist
              </h4>
              <span className="text-xs text-gray-500">{total} vídeos</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {playlist.map((v, i) => {
                const isActive = v.id === video.id
                return (
                  <button
                    key={v.id}
                    onClick={() => onSelect(v)}
                    className="group flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5"
                    style={isActive ? { backgroundColor: "#6d28d915" } : undefined}
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                      style={
                        isActive
                          ? { backgroundColor: "#6d28d9", color: "#fff" }
                          : { backgroundColor: "#ffffff08", color: "#9ca3af" }
                      }
                    >
                      {isActive ? <Play className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: isActive ? "#fff" : "#d1d5db" }}
                      >
                        {v.title}
                      </p>
                      <p className="text-[11px]" style={{ color: isActive ? "#a78bfa" : "#6b7280" }}>
                        {tags.find((t) => t.key === v.tag)?.label ?? v.tag}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer com navegação */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4" style={{ backgroundColor: "#16161d" }}>
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="group inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-gray-300"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 group-disabled:group-hover:translate-x-0" />
            Anterior
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-[0_0_20px_rgba(109,40,217,0.4)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:shadow-none"
            style={{ backgroundColor: "#6d28d9" }}
          >
            Próximo
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-disabled:group-hover:translate-x-0" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: course, isLoading } = useCourse(slug ?? "")
  const [activeTag, setActiveTag] = useState("todos")
  const [playingVideo, setPlayingVideo] = useState<CourseVideo | null>(null)

  const videos = course?.videos ?? []

  const filtered = useMemo(() => {
    if (activeTag === "todos") return videos
    return videos.filter((v: CourseVideo) => v.tag === activeTag)
  }, [videos, activeTag])

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-white/5" />
          <div className="h-10 w-2/3 rounded bg-white/5" />
          <div className="h-10 w-full rounded-xl bg-white/5" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold text-white">Conteúdo não encontrado</h2>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: "#6d28d9" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {/* Title */}
      <h1 className="mb-2 text-2xl font-bold text-white">{course.title}</h1>
      {course.description && (
        <p className="mb-6 text-sm text-gray-400">{course.description}</p>
      )}

      {/* Filter tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {tags.map((tag) => (
          <button
            key={tag.key}
            onClick={() => setActiveTag(tag.key)}
            className="flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={
              activeTag === tag.key
                ? { backgroundColor: "#6d28d9", color: "#fff" }
                : { backgroundColor: "#ffffff0d", color: "#9ca3af" }
            }
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Videos grid */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-white/5 py-16"
          style={{ backgroundColor: "#16161d" }}
        >
          <Play className="mb-3 h-10 w-10 text-gray-600" />
          <p className="text-sm text-gray-400">
            {activeTag === "todos"
              ? "Nenhum vídeo adicionado ainda."
              : `Nenhum vídeo de "${tags.find((t) => t.key === activeTag)?.label}" encontrado.`}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTag}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((video: CourseVideo, i: number) => (
              <VideoCard
                key={video.id}
                video={video}
                index={i}
                onPlay={setPlayingVideo}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Video modal */}
      <AnimatePresence>
        {playingVideo && (() => {
          const currentIdx = filtered.findIndex((v: CourseVideo) => v.id === playingVideo.id)
          return (
            <VideoModal
              video={playingVideo}
              onClose={() => setPlayingVideo(null)}
              onPrev={() => currentIdx > 0 && setPlayingVideo(filtered[currentIdx - 1])}
              onNext={() => currentIdx < filtered.length - 1 && setPlayingVideo(filtered[currentIdx + 1])}
              hasPrev={currentIdx > 0}
              hasNext={currentIdx < filtered.length - 1}
              total={filtered.length}
              playlist={filtered}
              onSelect={setPlayingVideo}
            />
          )
        })()}
      </AnimatePresence>
    </AppLayout>
  )
}
