import { useState } from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { useCreateCourseVideo, useUpdateCourseVideo } from "@/hooks/useCourseVideos"
import { VIDEO_TAG_OPTIONS } from "@/lib/videoTags"
import type { CourseVideo } from "@/types"

interface VideoFormProps {
  courseId: number
  editing: CourseVideo | null
  onDone: () => void
}

export default function VideoForm({ courseId, editing, onDone }: VideoFormProps) {
  const [title, setTitle] = useState(editing?.title ?? "")
  const [videoUrl, setVideoUrl] = useState(editing?.video_url ?? "")
  const [tag, setTag] = useState(editing?.tag ?? "todos")
  const [saving, setSaving] = useState(false)

  const createVideo = useCreateCourseVideo(courseId)
  const updateVideo = useUpdateCourseVideo(courseId)

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Título é obrigatório")
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateVideo.mutateAsync({ id: editing.id, title, video_url: videoUrl, tag })
      } else {
        await createVideo.mutateAsync({ title, video_url: videoUrl, tag })
      }
      toast.success(editing ? "Vídeo atualizado!" : "Vídeo adicionado!")
      onDone()
    } catch {
      toast.error("Erro ao salvar vídeo.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-lg border border-purple-500/20 p-4 space-y-3"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">Título do vídeo</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
            placeholder="Ex: Agachamento no V8"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">Categoria</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
            style={{ backgroundColor: "#0a0a0f" }}
          >
            {VIDEO_TAG_OPTIONS.map((t) => (
              <option
                key={t.value}
                value={t.value}
                style={{ backgroundColor: "#16161d", color: "#e4e4e7" }}
              >
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Link do vídeo (YouTube/Vimeo)
        </label>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: "#6d28d9" }}
        >
          <Check className="h-3.5 w-3.5" />
          {saving ? "Salvando..." : "Salvar Vídeo"}
        </button>
        <button
          onClick={onDone}
          className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-gray-400 hover:bg-white/5"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
