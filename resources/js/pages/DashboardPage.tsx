import { motion } from "framer-motion"
import { Newspaper } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <AppLayout>
      <PageHeader
        title={`Bem-vindo, ${user?.name ?? "Usuário"}!`}
        description="Confira as últimas novidades da Live Universe."
      />

      {/* News placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center rounded-xl border border-white/5 py-20"
        style={{ backgroundColor: "#16161d" }}
      >
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#6d28d915" }}
        >
          <Newspaper className="h-8 w-8" style={{ color: "#6d28d9" }} />
        </div>
        <h3 className="text-lg font-semibold text-white">Notícias em breve</h3>
        <p className="mt-2 max-w-md text-center text-sm text-gray-400">
          Aqui você vai encontrar as últimas novidades, atualizações e comunicados da Live Universe.
        </p>
      </motion.div>
    </AppLayout>
  )
}
