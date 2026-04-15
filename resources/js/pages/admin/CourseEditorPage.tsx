import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Save,
  ArrowLeft,
  Upload,
  Video,
  Image,
  Plus,
  Trash2,
  Pencil,
  Check,
  GripVertical,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import {
  useAdminCourse,
  useCreateCourse,
  useUpdateCourse,
} from "@/hooks/useCourses"
import { useCategories } from "@/hooks/useCategories"
import {
  useCourseVideos,
  useCreateCourseVideo,
  useUpdateCourseVideo,
  useDeleteCourseVideo,
  useReorderCourseVideos,
} from "@/hooks/useCourseVideos"
import type { CourseVideo } from "@/types"

const TAG_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "forca", label: "Força" },
  { value: "hit", label: "Hit" },
  { value: "cardio", label: "Cardio" },
  { value: "alongamento", label: "Alongamento" },
  { value: "sport", label: "Sport" },
]

// ── Zod Schema ──
const courseSchema = z.object({
  title: z.string().min(3, "Titulo deve ter no minimo 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter no minimo 3 caracteres"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  category_id: z.coerce.number().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimated_hours: z.coerce.number().min(0).optional(),
  status: z.enum(["draft", "published", "archived"]),
  is_featured: z.boolean(),
})

type CourseFormData = z.infer<typeof courseSchema>

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

// ── Sortable Video Item ──
function SortableVideoItem({
  video,
  onEdit,
  onDelete,
}: {
  video: CourseVideo
  onEdit: (v: CourseVideo) => void
  onDelete: (id: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: video.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? "#1a1a24" : "#0a0a0f",
    boxShadow: isDragging ? "0 10px 30px -5px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.25)" : undefined,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.95 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/5"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab touch-none rounded p-1 text-gray-500 transition-colors hover:bg-white/5 hover:text-purple-300 active:cursor-grabbing"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Video className="h-4 w-4 text-purple-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{video.title}</p>
        <p className="text-xs text-gray-500 truncate">{video.video_url ?? "Sem link"}</p>
      </div>
      <span
        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
        style={{ backgroundColor: "#6d28d915", color: "#a78bfa" }}
      >
        {TAG_OPTIONS.find((t) => t.value === video.tag)?.label ?? video.tag}
      </span>
      <button
        onClick={() => onEdit(video)}
        className="flex-shrink-0 rounded p-1.5 text-gray-500 hover:bg-white/5 hover:text-white"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onDelete(video.id)}
        className="flex-shrink-0 rounded p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ── Sortable Video List ──
function SortableVideoList({
  videos,
  courseId,
  onEdit,
  onDelete,
}: {
  videos: CourseVideo[]
  courseId: number
  onEdit: (v: CourseVideo) => void
  onDelete: (id: number) => void
}) {
  const reorder = useReorderCourseVideos(courseId)
  const [items, setItems] = useState<CourseVideo[]>(videos)

  useEffect(() => {
    setItems(videos)
  }, [videos])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((v) => v.id === active.id)
    const newIndex = items.findIndex((v) => v.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    reorder.mutate(newItems.map((v) => v.id), {
      onError: () => {
        toast.error("Erro ao reordenar.")
        setItems(videos)
      },
    })
  }

  return (
    <div
      className="space-y-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden"
      style={{ maxHeight: "520px", scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          {items.map((v) => (
            <SortableVideoItem key={v.id} video={v} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

// ── Add/Edit Video Form ──
function VideoForm({
  courseId,
  editing,
  onDone,
}: {
  courseId: number
  editing: CourseVideo | null
  onDone: () => void
}) {
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
            {TAG_OPTIONS.map((t) => (
              <option key={t.value} value={t.value} style={{ backgroundColor: "#16161d", color: "#e4e4e7" }}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">Link do vídeo (YouTube/Vimeo)</label>
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

// ── Main Page ──
export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id
  const courseId = id ? Number(id) : 0

  const { data: course, isLoading: courseLoading } = useAdminCourse(courseId, { enabled: isEditMode })
  const { data: categoriesData } = useCategories()
  const categories = categoriesData ?? []

  const { data: videos } = useCourseVideos(courseId)
  const deleteVideo = useDeleteCourseVideo(courseId)

  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const thumbnailRef = useRef<HTMLInputElement>(null)

  const [showVideoForm, setShowVideoForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<CourseVideo | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: "", slug: "", short_description: "", description: "",
      category_id: undefined, difficulty: "beginner",
      estimated_hours: 0, status: "draft", is_featured: false,
    },
  })

  useEffect(() => {
    if (course) {
      reset({
        title: course.title, slug: course.slug,
        short_description: course.short_description ?? "",
        description: course.description ?? "",
        category_id: course.category_id ?? undefined,
        difficulty: (course.difficulty as any) ?? "beginner",
        status: (course.status as any) ?? "draft",
        estimated_hours: course.estimated_hours ?? 0,
        is_featured: course.is_featured ?? false,
      })
      if (course.thumbnail_path) setThumbnailPreview(course.thumbnail_path)
    }
  }, [course, reset])

  const title = watch("title")
  useEffect(() => {
    if (!isEditMode && title) setValue("slug", slugify(title))
  }, [title, isEditMode, setValue])

  const onSubmit = async (formData: CourseFormData) => {
    try {
      const payload: Record<string, unknown> = {}
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          payload[key] = key === "is_featured" ? (val ? 1 : 0) : val
        }
      })

      if (isEditMode && id) {
        await updateCourse.mutateAsync({ id: Number(id), payload })
        toast.success("Curso atualizado!")
      } else {
        const result = await createCourse.mutateAsync(payload)
        toast.success("Curso criado!")
        navigate(`/admin/courses/${result.id}/edit`, { replace: true })
      }
    } catch {
      toast.error("Erro ao salvar curso.")
    }
  }

  async function handleDeleteVideo(videoId: number) {
    try {
      await deleteVideo.mutateAsync(videoId)
      toast.success("Vídeo removido!")
    } catch {
      toast.error("Erro ao remover vídeo.")
    }
  }

  if (isEditMode && courseLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/courses")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Cursos
        </button>
      </div>

      <PageHeader
        title={isEditMode ? "Editar Curso" : "Novo Curso"}
        description={isEditMode ? "Edite os dados do curso" : "Preencha os dados do novo curso"}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-xl border border-white/5 p-6 space-y-6" style={{ backgroundColor: "#16161d" }}>
          {/* Title + Slug */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Título</label>
              <input {...register("title")} className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500" style={{ backgroundColor: "#0a0a0f" }} placeholder="Nome do equipamento" />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Slug</label>
              <input {...register("slug")} className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500" style={{ backgroundColor: "#0a0a0f" }} />
              {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p>}
            </div>
          </div>

          {/* Short description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Descrição curta</label>
            <input {...register("short_description")} className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500" style={{ backgroundColor: "#0a0a0f" }} placeholder="Breve descrição" />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Descrição completa</label>
            <textarea {...register("description")} rows={3} className="w-full resize-none rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500" style={{ backgroundColor: "#0a0a0f" }} />
          </div>

          {/* Category + Difficulty */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Categoria</label>
              <select {...register("category_id")} className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500" style={{ backgroundColor: "#0a0a0f" }}>
                <option value="">Selecione...</option>
                {categories.map((cat: { id: number; name: string }) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Status</label>
              <select {...register("status")} className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500" style={{ backgroundColor: "#0a0a0f" }}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Thumbnail</label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/10" style={{ backgroundColor: "#0a0a0f" }}>
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Image className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <button type="button" onClick={() => thumbnailRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5">
                <Upload className="h-4 w-4" />
                Enviar imagem
              </button>
              <input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setThumbnailPreview(URL.createObjectURL(file))
              }} />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#6d28d9" }}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Salvando..." : "Salvar Curso"}
          </button>
        </div>
      </form>

      {/* ── Videos Section (only in edit mode) ── */}
      {isEditMode && (
        <div className="mt-8 rounded-xl border border-white/5 p-6" style={{ backgroundColor: "#16161d" }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Video className="h-5 w-5 text-purple-400" />
              Vídeos ({videos?.length ?? 0})
            </h3>
            {!showVideoForm && (
              <button
                onClick={() => { setEditingVideo(null); setShowVideoForm(true) }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white"
                style={{ backgroundColor: "#6d28d9" }}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Vídeo
              </button>
            )}
          </div>

          {/* Add/Edit form */}
          {showVideoForm && (
            <div className="mb-4">
              <VideoForm
                courseId={courseId}
                editing={editingVideo}
                onDone={() => { setShowVideoForm(false); setEditingVideo(null) }}
              />
            </div>
          )}

          {/* Video list */}
          {videos && videos.length > 0 ? (
            <SortableVideoList
              videos={videos}
              courseId={courseId}
              onEdit={(v) => { setEditingVideo(v); setShowVideoForm(true) }}
              onDelete={handleDeleteVideo}
            />
          ) : !showVideoForm ? (
            <p className="text-center text-sm text-gray-500 py-6">
              Nenhum vídeo adicionado. Clique em "Adicionar Vídeo" para começar.
            </p>
          ) : null}
        </div>
      )}
    </AppLayout>
  )
}
