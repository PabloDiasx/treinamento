import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Users as UsersIcon,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/useUsers"
import type { User } from "@/types"

const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter no minimo 2 caracteres"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
  role: z.enum(["admin", "instructor", "student"]),
  is_active: z.boolean(),
})

const editUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter no minimo 2 caracteres"),
  email: z.string().email("Email invalido"),
  role: z.enum(["admin", "instructor", "student"]),
  is_active: z.boolean(),
})

type CreateUserFormData = z.infer<typeof createUserSchema>
type EditUserFormData = z.infer<typeof editUserSchema>

const roleLabels: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-purple-500/10 text-purple-400" },
  instructor: { label: "Instrutor", className: "bg-blue-500/10 text-blue-400" },
  student: { label: "Aluno", className: "bg-green-500/10 text-green-400" },
}

export default function ManageUsersPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const { data, isLoading } = useAdminUsers({
    page,
    search: search || undefined,
    role: roleFilter || undefined,
  })
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const users = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const total = data?.total ?? 0

  // Create form
  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      is_active: true,
    },
  })

  // Edit form
  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "student",
      is_active: true,
    },
  })

  const openCreate = () => {
    setEditingUser(null)
    createForm.reset({
      name: "",
      email: "",
      password: "",
      role: "student",
      is_active: true,
    })
    setModalOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "instructor" | "student",
      is_active: user.is_active,
    })
    setModalOpen(true)
  }

  const onSubmitCreate = async (data: CreateUserFormData) => {
    try {
      await createUser.mutateAsync(data)
      toast.success("Usuario criado com sucesso!")
      setModalOpen(false)
      createForm.reset()
    } catch {
      toast.error("Erro ao criar usuario.")
    }
  }

  const onSubmitEdit = async (data: EditUserFormData) => {
    if (!editingUser) return
    try {
      await updateUser.mutateAsync({ id: editingUser.id, ...data })
      toast.success("Usuario atualizado com sucesso!")
      setModalOpen(false)
    } catch {
      toast.error("Erro ao atualizar usuario.")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser.mutateAsync(deleteTarget.id)
      toast.success("Usuario excluido com sucesso!")
      setDeleteTarget(null)
    } catch {
      toast.error("Erro ao excluir usuario.")
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Gerenciar Usuarios"
        description={`${total} usuario(s)`}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#6d28d9" }}
          >
            <Plus className="h-4 w-4" />
            Novo Usuario
          </button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-purple-500"
          style={{ backgroundColor: "#16161d" }}
        >
          <option value="">Todos</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instrutor</option>
          <option value="student">Aluno</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl border border-white/5"
        style={{ backgroundColor: "#16161d" }}
      >
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-white/5" />
                <div className="h-4 flex-1 rounded bg-white/5" />
                <div className="h-4 w-32 rounded bg-white/5" />
                <div className="h-4 w-20 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <UsersIcon className="mb-3 h-12 w-12" />
            <p className="text-lg font-medium">Nenhum usuario encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-gray-400">
                  <th className="px-6 py-3 font-medium">Avatar</th>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Perfil</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Data Cadastro</th>
                  <th className="px-6 py-3 font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user: User) => {
                  const role = roleLabels[user.role] ?? {
                    label: user.role,
                    className: "bg-gray-500/10 text-gray-400",
                  }
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                            style={{ backgroundColor: "#6d28d9" }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${role.className}`}
                        >
                          {role.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.is_active
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {user.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
            <p className="text-sm text-gray-400">
              Pagina {page} de {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Proximo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
                  {editingUser ? "Editar Usuario" : "Novo Usuario"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {editingUser ? (
                <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Nome</label>
                    <input
                      {...editForm.register("name")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                    />
                    {editForm.formState.errors.name && (
                      <p className="mt-1 text-xs text-red-400">{editForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
                    <input
                      type="email"
                      {...editForm.register("email")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                    />
                    {editForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-400">{editForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Perfil</label>
                    <select
                      {...editForm.register("role")}
                      className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      style={{ backgroundColor: "#0a0a0f" }}
                    >
                      <option value="admin">Admin</option>
                      <option value="instructor">Instrutor</option>
                      <option value="student">Aluno</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        {...editForm.register("is_active")}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-gray-400 after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:bg-white" />
                    </label>
                    <span className="text-sm text-gray-300">Ativo</span>
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
                      disabled={editForm.formState.isSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: "#6d28d9" }}
                    >
                      <Save className="h-4 w-4" />
                      {editForm.formState.isSubmitting ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Nome</label>
                    <input
                      {...createForm.register("name")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      placeholder="Nome completo"
                    />
                    {createForm.formState.errors.name && (
                      <p className="mt-1 text-xs text-red-400">{createForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
                    <input
                      type="email"
                      {...createForm.register("email")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      placeholder="email@exemplo.com"
                    />
                    {createForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-400">{createForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Senha</label>
                    <input
                      type="password"
                      {...createForm.register("password")}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      placeholder="Minimo 6 caracteres"
                    />
                    {createForm.formState.errors.password && (
                      <p className="mt-1 text-xs text-red-400">{createForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Perfil</label>
                    <select
                      {...createForm.register("role")}
                      className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                      style={{ backgroundColor: "#0a0a0f" }}
                    >
                      <option value="admin">Admin</option>
                      <option value="instructor">Instrutor</option>
                      <option value="student">Aluno</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        {...createForm.register("is_active")}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-gray-400 after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:bg-white" />
                    </label>
                    <span className="text-sm text-gray-300">Ativo</span>
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
                      disabled={createForm.formState.isSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: "#6d28d9" }}
                    >
                      <Save className="h-4 w-4" />
                      {createForm.formState.isSubmitting ? "Criando..." : "Criar"}
                    </button>
                  </div>
                </form>
              )}
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
                  <h3 className="text-lg font-semibold text-white">Excluir Usuario</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Tem certeza que deseja excluir o usuario{" "}
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
                  disabled={deleteUser.isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteUser.isPending ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
