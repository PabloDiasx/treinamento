import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderTree,
  Newspaper,
  Menu,
  X,
  ChevronLeft,
  FolderOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import UserPopover from "./UserPopover"

interface AppLayoutProps {
  children: React.ReactNode
}

const adminLinks = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard },
  { to: "/admin/courses", label: "Cursos", icon: BookOpen },
  { to: "/admin/categories", label: "Categorias", icon: FolderTree },
  { to: "/admin/news", label: "Notícias", icon: Newspaper },
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

  const isAdmin = user?.role === "admin" || user?.role === "instructor"
  const isAdminSection = location.pathname.startsWith("/admin")

  const isStudentSection = !isAdminSection
  const navLinks = isAdminSection && isAdmin ? adminLinks : []

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 transition-transform duration-300 lg:translate-x-0",
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

        <UserPopover onLogout={handleLogout} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
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
