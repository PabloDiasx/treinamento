import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  FolderTree,
  Save,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories"
import type { Category } from "@/types"

const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter no minimo 2 caracteres"),
  slug: z.string().min(2, "Slug deve ter no minimo 2 caracteres"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sort_order: z.coerce.number().min(0),
})

type CategoryFormData = z.infer<typeof categorySchema>

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export default function ManageCategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      color: "#6d28d9",
      sort_order: 0,
    },
  })

  const openCreate = () => {
    setEditingCategory(null)
    reset({
      name: "",
      slug: "",
      description: "",
      icon: "",
      color: "#6d28d9",
      sort_order: 0,
    })
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      icon: cat.icon ?? "",
      color: cat.color ?? "#6d28d9",
      sort_order: cat.sort_order,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...data })
        toast.success("Categoria atualizada com sucesso!")
      } else {
        await createCategory.mutateAsync(data)
        toast.success("Categoria criada com sucesso!")
      }
      setModalOpen(false)
      reset()
    } catch {
      toast.error("Erro ao salvar categoria.")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCategory.mutateAsync(deleteTarget.id)
      toast.success("Categoria excluida com sucesso!")
      setDeleteTarget(null)
    } catch {
      toast.error("Erro ao excluir categoria.")
    }
  }

  const catList = categories ?? []

  return (
    <AppLayout>
      <PageHeader
        title="Gerenciar Categorias"
        description={`${catList.length} categoria(s)`}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#6d28d9" }}
          >
            <Plus className="h-4 w-4" />
            Nova Categoria
          </button>
        }
      />

      {/* Categories grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-white/5 p-6"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="h-10 w-10 rounded-lg bg-white/5" />
              <div className="mt-3 h-5 w-32 rounded bg-white/5" />
              <div className="mt-2 h-4 w-20 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : catList.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-white/5 py-16"
          style={{ backgroundColor: "#16161d" }}
        >
          <FolderTree className="mb-3 h-12 w-12 text-gray-600" />
          <p className="text-lg font-medium text-gray-400">Nenhuma categoria</p>
          <p className="mt-1 text-sm text-gray-500">Crie a primeira categoria.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catList.map((cat: Category) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-xl border border-white/5 p-6 transition-colors hover:border-white/10"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {cat.color && (
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: cat.color + "20" }}
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-500">{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {cat.description && (
                <p className="mt-3 text-sm text-gray-400 line-clamp-2">
                  {cat.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                {cat.icon && <span>Icone: {cat.icon}</span>}
                <span>Ordem: {cat.sort_order}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
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
              className="w-full max-w-lg rounded-xl border border-white/5 p-6"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Nome</label>
                    <input
                      {...register("name", {
                        onChange: (e) => {
                          if (!editingCategory) {
                            setValue("slug", slugify(e.target.value))
                          }
                        },
                      })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      placeholder="Nome da categoria"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Slug</label>
                    <input
                      {...register("slug")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      placeholder="slug-da-categoria"
                    />
                    {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Descricao</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500 resize-none"
                    placeholder="Descricao da categoria"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Icone (Lucide)</label>
                    <input
                      {...register("icon")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      placeholder="book-open"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Cor</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        {...register("color")}
                        className="h-10 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
                      />
                      <input
                        {...register("color")}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                        placeholder="#6d28d9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Ordem</label>
                    <input
                      type="number"
                      {...register("sort_order")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      min={0}
                    />
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
                  <h3 className="text-lg font-semibold text-white">Excluir Categoria</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Tem certeza que deseja excluir a categoria{" "}
                    <strong className="text-white">{deleteTarget.name}</strong>?
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
                  disabled={deleteCategory.isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteCategory.isPending ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
