import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { Save, User, Mail, FileText } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"

export default function ProfilePage() {
  const { user } = useAuth()

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [bio, setBio] = useState(user?.bio ?? "")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await apiClient.put("/user/profile", { name, email, bio })
      toast.success("Perfil atualizado com sucesso!")
    } catch {
      toast.error("Erro ao atualizar perfil.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader title="Meu Perfil" description="Edite suas informações pessoais" />

      <div
        className="mx-auto max-w-2xl rounded-xl border border-white/5 p-6"
        style={{ backgroundColor: "#16161d" }}
      >
        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <User className="h-4 w-4 text-gray-500" />
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
              placeholder="Seu nome completo"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Mail className="h-4 w-4 text-gray-500" />
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
              placeholder="seu@email.com"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <FileText className="h-4 w-4 text-gray-500" />
              Biografia
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
              placeholder="Conte um pouco sobre você..."
            />
          </div>

          {/* Role info (read-only) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Nível de acesso</label>
            <div className="flex items-center gap-2">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: user?.role === "admin" ? "#6d28d915" : "#10b98115",
                  color: user?.role === "admin" ? "#a78bfa" : "#34d399",
                }}
              >
                {user?.role === "admin"
                  ? "Administrador"
                  : user?.role === "instructor"
                    ? "Instrutor"
                    : "Aluno"}
              </span>
            </div>
          </div>

          {/* Save button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#6d28d9" }}
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
