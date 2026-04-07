import { useState } from "react"
import { toast } from "sonner"
import { Bell, Mail, BookOpen, Award, MessageSquare } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"

interface NotifToggle {
  key: string
  label: string
  description: string
  icon: React.ElementType
  enabled: boolean
}

const defaultToggles: NotifToggle[] = [
  {
    key: "email_new_course",
    label: "Novos cursos",
    description: "Receber e-mail quando novos cursos forem publicados",
    icon: BookOpen,
    enabled: true,
  },
  {
    key: "email_progress",
    label: "Resumo semanal",
    description: "Receber um resumo semanal do seu progresso",
    icon: Mail,
    enabled: true,
  },
  {
    key: "email_certificate",
    label: "Certificados",
    description: "Receber e-mail quando um certificado for emitido",
    icon: Award,
    enabled: true,
  },
  {
    key: "email_ai",
    label: "Dicas da IA",
    description: "Receber sugestões de estudo personalizadas",
    icon: MessageSquare,
    enabled: false,
  },
]

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: enabled ? "#6d28d9" : "#27272a" }}
    >
      <span
        className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
        style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  )
}

export default function NotificationsPage() {
  const [toggles, setToggles] = useState(defaultToggles)

  function handleToggle(key: string, value: boolean) {
    setToggles((prev) =>
      prev.map((t) => (t.key === key ? { ...t, enabled: value } : t)),
    )
    toast.success("Preferência atualizada!")
  }

  return (
    <AppLayout>
      <PageHeader
        title="Notificações"
        description="Gerencie suas preferências de notificação"
      />

      <div
        className="mx-auto max-w-2xl rounded-xl border border-white/5 p-6"
        style={{ backgroundColor: "#16161d" }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-white">Notificações por E-mail</h3>
        </div>

        <div className="space-y-1">
          {toggles.map((toggle) => {
            const Icon = toggle.icon
            return (
              <div
                key={toggle.key}
                className="flex items-center justify-between rounded-lg px-4 py-3.5 transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-white">{toggle.label}</p>
                    <p className="text-xs text-gray-500">{toggle.description}</p>
                  </div>
                </div>
                <Toggle
                  enabled={toggle.enabled}
                  onChange={(v) => handleToggle(toggle.key, v)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
