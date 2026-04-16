import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  UserCog,
  KeyRound,
  Bell,
  Users,
  Database,
  FolderTree,
  Palette,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

interface UserPopoverProps {
  onLogout: () => void
}

export default function UserPopover({ onLogout }: UserPopoverProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role === "admin" || user?.role === "instructor"

  const roleLabel =
    user?.role === "admin"
      ? "Administrador"
      : user?.role === "instructor"
        ? "Instrutor"
        : "Aluno"

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  const menuItemClass =
    "flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"

  return (
    <div className="relative border-t border-white/5 p-4" ref={ref}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-white/10 shadow-2xl"
            style={{ backgroundColor: "#1e1e2a" }}
          >
            {/* Header */}
            <div className="border-b border-white/5 px-4 py-3">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <span
                className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: user?.role === "admin" ? "#6d28d915" : "#10b98115",
                  color: user?.role === "admin" ? "#a78bfa" : "#34d399",
                }}
              >
                {roleLabel}
              </span>
            </div>

            {/* Menu */}
            <div className="py-1">
              <button onClick={() => go("/settings/profile")} className={menuItemClass}>
                <UserCog className="h-4 w-4" />
                Meu Perfil
              </button>
              <button onClick={() => go("/settings/security")} className={menuItemClass}>
                <KeyRound className="h-4 w-4" />
                Senha e Segurança
              </button>
              <button onClick={() => go("/settings/notifications")} className={menuItemClass}>
                <Bell className="h-4 w-4" />
                Notificações
              </button>

              {isAdmin && (
                <>
                  <div className="my-1 border-t border-white/5" />
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Administração
                  </p>
                  <button onClick={() => go("/admin/users")} className={menuItemClass}>
                    <Users className="h-4 w-4" />
                    Gerenciar Usuários
                  </button>
                  <button onClick={() => go("/admin/courses")} className={menuItemClass}>
                    <Database className="h-4 w-4" />
                    Gerenciar Cursos
                  </button>
                  <button onClick={() => go("/admin/categories")} className={menuItemClass}>
                    <FolderTree className="h-4 w-4" />
                    Gerenciar Categorias
                  </button>
                  <button onClick={() => go("/settings/appearance")} className={menuItemClass}>
                    <Palette className="h-4 w-4" />
                    Aparência
                  </button>
                </>
              )}

              <div className="my-1 border-t border-white/5" />
              <button
                onClick={() => {
                  setOpen(false)
                  onLogout()
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-lg p-1 transition-colors hover:bg-white/5"
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: "#6d28d9" }}
        >
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-gray-500 transition-transform",
            open && "rotate-90",
          )}
        />
      </button>
    </div>
  )
}
