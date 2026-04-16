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
} from "lucide-react"
import { toast } from "sonner"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import SortableVideoList from "@/components/admin/SortableVideoList"
import VideoForm from "@/components/admin/VideoForm"
import {
  useAdminCourse,
  useCreateCourse,
  useUpdateCourse,
} from "@/hooks/useCourses"
import { useCategories } from "@/hooks/useCategories"
import {
  useCourseVideos,
  useDeleteCourseVideo,
} from "@/hooks/useCourseVideos"
import type { CourseVideo } from "@/types"

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
