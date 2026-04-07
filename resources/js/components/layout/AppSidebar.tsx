import { NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Search,
  Award,
  Shield,
  BookMarked,
  FolderTree,
  Users,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const mainMenu: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Meus Cursos", icon: BookOpen, href: "/my-courses" },
  { label: "Catalogo", icon: Search, href: "/courses" },
  { label: "Certificados", icon: Award, href: "/certificates" },
]

const adminMenu: NavItem[] = [
  { label: "Painel Admin", icon: Shield, href: "/admin" },
  { label: "Cursos", icon: BookMarked, href: "/admin/courses" },
  { label: "Categorias", icon: FolderTree, href: "/admin/categories" },
]

const adminOnlyMenu: NavItem[] = [
  { label: "Usuarios", icon: Users, href: "/admin/users" },
]

function SidebarLink({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  return (
    <NavLink
      to={item.href}
      end={item.href === "/admin"}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          "hover:bg-secondary hover:text-foreground",
          isActive
            ? "border-l-[3px] border-primary bg-secondary text-foreground"
            : "border-l-[3px] border-transparent text-muted-foreground",
          collapsed && "justify-center px-2",
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  )
}

function SectionTitle({
  title,
  collapsed,
}: {
  title: string
  collapsed: boolean
}) {
  if (collapsed) {
    return <div className="mx-auto my-2 h-px w-6 bg-border" />
  }

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      {title}
    </motion.p>
  )
}

export default function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { user } = useAuth()

  const isAdminOrInstructor =
    user?.role === "admin" || user?.role === "instructor"
  const isAdmin = user?.role === "admin"

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex h-full flex-col border-r border-border bg-card"
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center gap-3 border-b border-border px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <GraduationCap className="h-7 w-7 shrink-0 text-primary" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap text-lg font-bold text-foreground"
            >
              Treinamento
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <SectionTitle title="Menu Principal" collapsed={collapsed} />
        <div className="space-y-1">
          {mainMenu.map((item) => (
            <SidebarLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        {isAdminOrInstructor && (
          <>
            <SectionTitle title="Administracao" collapsed={collapsed} />
            <div className="space-y-1">
              {adminMenu.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
              {isAdmin &&
                adminOnlyMenu.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                  />
                ))}
            </div>
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5" />
          ) : (
            <ChevronsLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </motion.aside>
  )
}
