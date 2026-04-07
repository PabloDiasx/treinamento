import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Bot, Heart, Share2, FileText } from "lucide-react"
import type { Lesson } from "@/types"

// ── Helpers ────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  // youtu.be/VIDEO_ID
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (short) return short[1]
  // youtube.com/watch?v=VIDEO_ID
  const long = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (long) return long[1]
  // youtube.com/embed/VIDEO_ID
  const embed = url.match(/embed\/([a-zA-Z0-9_-]{11})/)
  if (embed) return embed[1]
  return null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

// ── Props ──────────────────────────────────────────────────────

interface VerticalVideoPlayerProps {
  lesson: Lesson
  isActive: boolean
  moduleName?: string
  onProgressUpdate?: (pct: number) => void
}

// ── Component ──────────────────────────────────────────────────

export default function VerticalVideoPlayer({
  lesson,
  isActive,
  moduleName,
  onProgressUpdate,
}: VerticalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayIcon, setShowPlayIcon] = useState(!isActive)
  const [progress, setProgress] = useState(0)
  const [liked, setLiked] = useState(false)

  // ── Local / External video autoplay ──────────────────────────

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.play().then(() => {
        setIsPlaying(true)
        setShowPlayIcon(false)
      }).catch(() => {
        // autoplay blocked by browser
        setIsPlaying(false)
        setShowPlayIcon(true)
      })
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [isActive])

  // ── Progress tracking for HTML5 video ────────────────────────

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.duration) return
    const pct = Math.round((video.currentTime / video.duration) * 100)
    setProgress(pct)
    onProgressUpdate?.(pct)
  }, [onProgressUpdate])

  // ── Tap to toggle ────────────────────────────────────────────

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true)
        setShowPlayIcon(false)
      }).catch(() => {})
    } else {
      video.pause()
      setIsPlaying(false)
      setShowPlayIcon(true)
    }
  }, [])

  // ── YouTube embed URL ────────────────────────────────────────

  const youtubeEmbedUrl = useMemo(() => {
    if (lesson.video_source !== "youtube" || !lesson.content_url) return null
    const videoId = extractYouTubeId(lesson.content_url)
    if (!videoId) return null
    const params = isActive
      ? "autoplay=1&controls=0&loop=0&modestbranding=1&playsinline=1&mute=0&rel=0"
      : "autoplay=0&controls=0&loop=0&modestbranding=1&playsinline=1&rel=0"
    return `https://www.youtube.com/embed/${videoId}?${params}`
  }, [lesson.video_source, lesson.content_url, isActive])

  // ── Vimeo embed URL ──────────────────────────────────────────

  const vimeoEmbedUrl = useMemo(() => {
    if (lesson.video_source !== "vimeo" || !lesson.content_url) return null
    const vimeoId = extractVimeoId(lesson.content_url)
    if (!vimeoId) return null
    const params = isActive
      ? "autoplay=1&title=0&byline=0&portrait=0&playsinline=1"
      : "autoplay=0&title=0&byline=0&portrait=0&playsinline=1"
    return `https://player.vimeo.com/video/${vimeoId}?${params}`
  }, [lesson.video_source, lesson.content_url, isActive])

  // ── Side buttons ─────────────────────────────────────────────

  const sideButtons = (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5"
    >
      <button
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Chat com IA"
      >
        <Bot className="h-5 w-5 text-white" />
      </button>
      <button
        className="flex flex-col items-center gap-1"
        onClick={() => setLiked((v) => !v)}
        aria-label="Curtir"
      >
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
            liked ? "bg-red-500/30" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-white"}`}
          />
        </span>
      </button>
      <button
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Compartilhar"
      >
        <Share2 className="h-5 w-5 text-white" />
      </button>
    </motion.div>
  )

  // ── Bottom info overlay ──────────────────────────────────────

  const bottomOverlay = (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="px-4 pb-5"
      >
        <p className="text-base font-bold leading-tight text-white drop-shadow-lg">
          {lesson.title}
        </p>
        {moduleName && (
          <p className="mt-1 text-sm text-gray-400 drop-shadow-lg">{moduleName}</p>
        )}
      </motion.div>

      {/* Progress bar */}
      <div className="h-[2px] w-full bg-white/10">
        <motion.div
          className="h-full bg-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  )

  // ── Center play/pause icon ───────────────────────────────────

  const centerPlayIcon = (
    <AnimatePresence>
      {showPlayIcon && (
        <motion.div
          key="play-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
            {isPlaying ? (
              <Pause className="h-10 w-10 text-white" />
            ) : (
              <Play className="ml-1 h-10 w-10 text-white" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // ── Gradient overlays for readability ────────────────────────

  const gradients = (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/50 to-transparent" />
    </>
  )

  // ── EBOOK type ───────────────────────────────────────────────

  if (lesson.type === "ebook") {
    return (
      <div className="relative flex h-full w-full items-center justify-center" style={{ backgroundColor: "#0a0a0f" }}>
        <div className="flex aspect-[9/16] w-full max-w-[400px] flex-col items-center justify-center gap-6 px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex h-24 w-24 items-center justify-center rounded-2xl bg-purple-500/15"
          >
            <FileText className="h-12 w-12 text-purple-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center"
          >
            <h3 className="text-xl font-bold text-white">
              {lesson.ebook?.title ?? lesson.title}
            </h3>
            {moduleName && (
              <p className="mt-2 text-sm text-gray-400">{moduleName}</p>
            )}
            {lesson.ebook?.page_count && (
              <p className="mt-1 text-xs text-gray-500">
                {lesson.ebook.page_count} paginas
              </p>
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-purple-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
          >
            Abrir Material
          </motion.button>
        </div>

        {sideButtons}
      </div>
    )
  }

  // ── TEXT type ─────────────────────────────────────────────────

  if (lesson.type === "text") {
    return (
      <div className="relative flex h-full w-full items-center justify-center" style={{ backgroundColor: "#0a0a0f" }}>
        <div className="flex aspect-[9/16] w-full max-w-[400px] flex-col px-6 py-12">
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-lg font-bold text-white"
          >
            {lesson.title}
          </motion.h3>
          {moduleName && (
            <p className="mb-4 text-xs text-gray-500">{moduleName}</p>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-1 overflow-y-auto rounded-xl border border-white/5 bg-white/[0.03] p-5 scrollbar-thin scrollbar-thumb-white/10"
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
              {lesson.content_text ?? "Sem conteudo disponivel."}
            </div>
          </motion.div>
        </div>

        {sideButtons}
      </div>
    )
  }

  // ── YOUTUBE video ────────────────────────────────────────────

  if (lesson.video_source === "youtube" && youtubeEmbedUrl) {
    return (
      <div className="relative h-full w-full" style={{ backgroundColor: "#0a0a0f" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <iframe
            key={`yt-${lesson.id}-${isActive}`}
            src={youtubeEmbedUrl}
            className="aspect-[9/16] h-full max-h-full w-auto"
            style={{ border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        </div>
        {gradients}
        {bottomOverlay}
        {sideButtons}
      </div>
    )
  }

  // ── VIMEO video ──────────────────────────────────────────────

  if (lesson.video_source === "vimeo" && vimeoEmbedUrl) {
    return (
      <div className="relative h-full w-full" style={{ backgroundColor: "#0a0a0f" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <iframe
            key={`vm-${lesson.id}-${isActive}`}
            src={vimeoEmbedUrl}
            className="aspect-[9/16] h-full max-h-full w-auto"
            style={{ border: "none" }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        </div>
        {gradients}
        {bottomOverlay}
        {sideButtons}
      </div>
    )
  }

  // ── LOCAL / EXTERNAL video (HTML5 <video>) ───────────────────

  const videoSrc =
    lesson.video_source === "local"
      ? lesson.content_url ?? ""
      : lesson.content_url ?? ""

  return (
    <div
      className="relative h-full w-full cursor-pointer select-none"
      style={{ backgroundColor: "#0a0a0f" }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ aspectRatio: "9/16" }}
        playsInline
        loop
        muted={false}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => {
          setIsPlaying(true)
          setShowPlayIcon(false)
        }}
        onPause={() => {
          setIsPlaying(false)
          setShowPlayIcon(true)
        }}
      />

      {gradients}
      {centerPlayIcon}
      {bottomOverlay}
      {sideButtons}
    </div>
  )
}
