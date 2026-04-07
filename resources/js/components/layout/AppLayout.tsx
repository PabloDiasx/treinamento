import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderTree,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  FolderOpen,
  UserCog,
  KeyRound,
  Bell,
  Palette,
  Database,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
}

const adminLinks = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard },
  { to: "/admin/courses", label: "Cursos", icon: BookOpen },
  { to: "/admin/categories", label: "Categorias", icon: FolderTree },
  { to: "/admin/users", label: "Usuarios", icon: Users },
]

const dashboardLink = { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }

const categoryLinks = [
  { to: "/como-manusear", label: "Como manusear os Equipamentos", icon: FolderOpen },
  { to: "/ebooks", label: "Ebooks", icon: FolderOpen },
  { to: "/exercicios-acessorios", label: "Exercícios com Acessórios", icon: FolderOpen },
  { to: "/exercicios-extras", label: "Exercícios Extras", icon: FolderOpen },
  { to: "/manuais", label: "Manuais", icon: FolderOpen },
  { to: "/videos-exercicios", label: "Vídeos de Exercícios", icon: FolderOpen },
  { to: "/videos-montagens", label: "Vídeos de Montagens", icon: FolderOpen },
]

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role === "admin" || user?.role === "instructor"
  const isAdminSection = location.pathname.startsWith("/admin")

  const isStudentSection = !isAdminSection
  const navLinks = isAdminSection && isAdmin ? adminLinks : []

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false)
      }
    }
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [popoverOpen])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const roleLabel =
    user?.role === "admin"
      ? "Administrador"
      : user?.role === "instructor"
        ? "Instrutor"
        : "Aluno"

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#0a0a0f" }}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#16161d" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <Link to="/dashboard">
            <span className="text-xl font-bold text-white">Live Universe</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {isAdminSection && (
            <div className="mb-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white hover:bg-white/5"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Link>
            </div>
          )}


          {isStudentSection ? (
            <>
              {/* Dashboard link */}
              {(() => {
                const isActive = location.pathname === dashboardLink.to
                const Icon = dashboardLink.icon
                return (
                  <Link
                    to={dashboardLink.to}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    style={isActive ? { backgroundColor: "#6d28d9" } : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    {dashboardLink.label}
                  </Link>
                )
              })()}

              {/* CATEGORIAS header */}
              <p className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Categorias
              </p>

              {/* Category links */}
              {categoryLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    style={isActive ? { backgroundColor: "#6d28d9" } : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                )
              })}
            </>
          ) : (
            navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                  style={isActive ? { backgroundColor: "#6d28d9" } : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              )
            })
          )}
        </nav>

        {/* User section with popover */}
        <div className="relative border-t border-white/5 p-4" ref={popoverRef}>
          <AnimatePresence>
            {popoverOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-white/10 shadow-2xl"
                style={{ backgroundColor: "#1e1e2a" }}
              >
                {/* Popover header */}
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

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { setPopoverOpen(false); navigate("/settings/profile") }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <UserCog className="h-4 w-4" />
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => { setPopoverOpen(false); navigate("/settings/security") }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <KeyRound className="h-4 w-4" />
                    Senha e Segurança
                  </button>
                  <button
                    onClick={() => { setPopoverOpen(false); navigate("/settings/notifications") }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Bell className="h-4 w-4" />
                    Notificações
                  </button>

                  {/* Admin-only options */}
                  {isAdmin && (
                    <>
                      <div className="my-1 border-t border-white/5" />
                      <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Administração
                      </p>
                      <button
                        onClick={() => { setPopoverOpen(false); navigate("/admin/users") }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Users className="h-4 w-4" />
                        Gerenciar Usuários
                      </button>
                      <button
                        onClick={() => { setPopoverOpen(false); navigate("/admin/courses") }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Database className="h-4 w-4" />
                        Gerenciar Cursos
                      </button>
                      <button
                        onClick={() => { setPopoverOpen(false); navigate("/admin/categories") }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <FolderTree className="h-4 w-4" />
                        Gerenciar Categorias
                      </button>
                      <button
                        onClick={() => { setPopoverOpen(false); navigate("/settings/appearance") }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Palette className="h-4 w-4" />
                        Aparência
                      </button>
                    </>
                  )}

                  {/* Logout */}
                  <div className="my-1 border-t border-white/5" />
                  <button
                    onClick={() => { setPopoverOpen(false); handleLogout() }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avatar button */}
          <button
            onClick={() => setPopoverOpen(!popoverOpen)}
            className="flex w-full items-center gap-3 rounded-lg p-1 transition-colors hover:bg-white/5"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "#6d28d9" }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="truncate text-sm font-medium text-white">
                {user?.name}
              </p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-gray-500 transition-transform",
                popoverOpen && "rotate-90"
              )}
            />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex h-16 items-center gap-4 border-b border-white/5 px-4 lg:px-8"
          style={{ backgroundColor: "#16161d" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
