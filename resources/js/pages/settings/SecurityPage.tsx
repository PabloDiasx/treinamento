import { useState } from "react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { Save, Lock, Eye, EyeOff } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.")
      return
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.")
      return
    }

    setSaving(true)
    try {
      await apiClient.put("/user/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      toast.success("Senha alterada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Erro ao alterar senha. Verifique a senha atual.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader title="Senha e Segurança" description="Altere sua senha de acesso" />

      <div
        className="mx-auto max-w-2xl rounded-xl border border-white/5 p-6"
        style={{ backgroundColor: "#16161d" }}
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Lock className="h-4 w-4 text-gray-500" />
              Senha Atual
            </label>
            <PasswordInput
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Digite sua senha atual"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Lock className="h-4 w-4 text-gray-500" />
              Nova Senha
            </label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Lock className="h-4 w-4 text-gray-500" />
              Confirmar Nova Senha
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repita a nova senha"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#6d28d9" }}
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Alterar Senha"}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
