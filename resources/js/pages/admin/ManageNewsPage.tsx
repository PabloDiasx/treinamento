import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pencil, Trash2, X, AlertTriangle, Newspaper, Save, Upload, Image as ImageIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import {
  useAdminNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
  useUploadNewsImage,
  type NewsItem,
} from "@/hooks/useNews"

interface NewsFormData {
  title: string
  content: string
  image_url: string
  is_published: boolean
  sort_order: number
}

export default function ManageNewsPage() {
  const { data: news, isLoading } = useAdminNews()
  const createNews = useCreateNews()
  const updateNews = useUpdateNews()
  const deleteNews = useDeleteNews()
  const uploadImage = useUploadNewsImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormData>({
    defaultValues: {
      title: "",
      content: "",
      image_url: "",
      is_published: true,
      sort_order: 0,
    },
  })

  const openCreate = () => {
    setEditing(null)
    reset({ title: "", content: "", image_url: "", is_published: true, sort_order: 0 })
    setModalOpen(true)
  }

  const openEdit = (n: NewsItem) => {
    setEditing(n)
    reset({
      title: n.title,
      content: n.content,
      image_url: n.image_url ?? "",
      is_published: n.is_published,
      sort_order: n.sort_order,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: NewsFormData) => {
    try {
      const payload = {
        ...data,
        image_url: data.image_url || null,
        sort_order: Number(data.sort_order),
      }
      if (editing) {
        await updateNews.mutateAsync({ id: editing.id, ...payload })
        toast.success("Notícia atualizada!")
      } else {
        await createNews.mutateAsync(payload)
        toast.success("Notícia criada!")
      }
      setModalOpen(false)
      reset()
    } catch {
      toast.error("Erro ao salvar notícia.")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteNews.mutateAsync(deleteTarget.id)
      toast.success("Notícia excluída!")
      setDeleteTarget(null)
    } catch {
      toast.error("Erro ao excluir notícia.")
    }
  }

  const list = news ?? []

  return (
    <AppLayout>
      <PageHeader
        title="Gerenciar Notícias"
        description={`${list.length} notícia(s)`}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#6d28d9" }}
          >
            <Plus className="h-4 w-4" />
            Nova Notícia
          </button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-white/5 p-6"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="h-5 w-64 rounded bg-white/5" />
              <div className="mt-3 h-4 w-full rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-white/5 py-16"
          style={{ backgroundColor: "#16161d" }}
        >
          <Newspaper className="mb-3 h-12 w-12 text-gray-600" />
          <p className="text-lg font-medium text-gray-400">Nenhuma notícia</p>
          <p className="mt-1 text-sm text-gray-500">Crie a primeira notícia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((n: NewsItem) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex items-start gap-4 rounded-xl border border-white/5 p-5 transition-colors hover:border-white/10"
              style={{ backgroundColor: "#16161d" }}
            >
              {n.image_url ? (
                <img
                  src={n.image_url}
                  alt={n.title}
                  className="h-20 w-28 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "#0a0a0f" }}>
                  <Newspaper className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{n.title}</h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{
                      backgroundColor: n.is_published ? "#10b98115" : "#ffffff0d",
                      color: n.is_published ? "#34d399" : "#9ca3af",
                    }}
                  >
                    {n.is_published ? "Publicada" : "Rascunho"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{n.content}</p>
                <p className="mt-2 text-xs text-gray-500">Ordem: {n.sort_order}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(n)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(n)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal criar/editar */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-xl border border-white/5 p-6"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editing ? "Editar Notícia" : "Nova Notícia"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Título</label>
                  <input
                    {...register("title", { required: "Título é obrigatório" })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                    placeholder="Título da notícia"
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Conteúdo</label>
                  <textarea
                    {...register("content", { required: "Conteúdo é obrigatório" })}
                    rows={6}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500 resize-none"
                    placeholder="Conteúdo da notícia"
                  />
                  {errors.content && <p className="mt-1 text-xs text-red-400">{errors.content.message}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Imagem (opcional)</label>
                  {watch("image_url") ? (
                    <div className="relative overflow-hidden rounded-lg border border-white/10" style={{ backgroundColor: "#0a0a0f" }}>
                      <img
                        src={watch("image_url")}
                        alt="Preview"
                        className="h-48 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setValue("image_url", "")}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadImage.isPending}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/10 py-8 text-sm text-gray-400 transition-colors hover:border-purple-500/40 hover:bg-white/5 disabled:opacity-50"
                        style={{ backgroundColor: "#0a0a0f" }}
                      >
                        {uploadImage.isPending ? (
                          <>
                            <Upload className="h-6 w-6 animate-pulse" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6" />
                            <span>Clique para enviar uma imagem</span>
                            <span className="text-xs text-gray-500">JPG, PNG, WEBP, GIF — até 8MB</span>
                          </>
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          try {
                            const url = await uploadImage.mutateAsync(file)
                            setValue("image_url", url)
                            toast.success("Imagem enviada!")
                          } catch {
                            toast.error("Erro ao enviar imagem.")
                          } finally {
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }
                        }}
                      />
                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-400">Ou colar URL externa</summary>
                        <input
                          {...register("image_url")}
                          className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                          placeholder="https://..."
                        />
                      </details>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Ordem</label>
                    <input
                      type="number"
                      {...register("sort_order")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      min={0}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("is_published")}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 accent-purple-600"
                      />
                      Publicar imediatamente
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "#6d28d9" }}
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl border border-white/5 p-6"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Excluir Notícia</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Tem certeza que deseja excluir <strong className="text-white">{deleteTarget.title}</strong>?
                  </p>
                </div>
                <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteNews.isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteNews.isPending ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
