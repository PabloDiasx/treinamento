import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Newspaper, Calendar, X } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import { useNews, type NewsItem } from "@/hooks/useNews"

function formatDate(date: string | null) {
  if (!date) return null
  try {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: news, isLoading } = useNews()
  const [selected, setSelected] = useState<NewsItem | null>(null)

  const list = news ?? []

  return (
    <AppLayout>
      <PageHeader
        title={`Bem-vindo, ${user?.name ?? "Usuário"}!`}
        description="Confira as últimas novidades da Live Universe."
      />

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl border border-white/5"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="aspect-[4/3] w-full bg-white/5" />
              <div className="p-4">
                <div className="h-4 w-3/4 rounded bg-white/5" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
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
          <h3 className="text-lg font-semibold text-white">Nenhuma notícia publicada</h3>
          <p className="mt-2 max-w-md text-center text-sm text-gray-400">
            Assim que uma notícia for publicada ela aparece aqui.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((n: NewsItem, i: number) => (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              onClick={() => setSelected(n)}
              className="group overflow-hidden rounded-xl border border-white/5 text-left transition-all hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(109,40,217,0.15)]"
              style={{ backgroundColor: "#16161d" }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: "#0a0a0f" }}>
                {n.image_url ? (
                  <img
                    src={n.image_url}
                    alt={n.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Newspaper className="h-10 w-10 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white line-clamp-2">{n.title}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(n.published_at) ?? formatDate(n.created_at)}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Modal de notícia completa */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              style={{ backgroundColor: "#0f0f17" }}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-black/50 text-gray-300 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="max-h-[90vh] overflow-y-auto">
                {selected.image_url && (
                  <img
                    src={selected.image_url}
                    alt={selected.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(selected.published_at) ?? formatDate(selected.created_at)}
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                    {selected.title}
                  </h2>
                  <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-300 sm:text-base">
                    {selected.content}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
