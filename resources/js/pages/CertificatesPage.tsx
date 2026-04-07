import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Award, Download, Trophy, Search } from "lucide-react"
import { apiClient } from "@/lib/api"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"
import type { Certificate } from "@/types"

// ── Helpers ─────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

// ── Certificate card ────────────────────────────────────────────

function CertificateCard({
  certificate,
  index,
}: {
  certificate: Certificate & { course?: { title?: string } }
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group overflow-hidden rounded-xl border border-white/5 p-6 transition-all duration-300 hover:border-white/10"
      style={{ backgroundColor: "#16161d" }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Award icon */}
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#6d28d915" }}
        >
          <Award className="h-8 w-8" style={{ color: "#6d28d9" }} />
        </div>

        {/* Course title */}
        <h3 className="mb-2 text-base font-semibold text-white line-clamp-2">
          {(certificate as any).course?.title ?? "Curso"}
        </h3>

        {/* Issued date */}
        <p className="mb-1 text-sm text-gray-400">
          Emitido em {formatDate(certificate.issued_at)}
        </p>

        {/* Certificate code */}
        <p className="mb-5 font-mono text-xs text-gray-500">
          {certificate.certificate_code}
        </p>

        {/* Download button */}
        <button
          onClick={() => {
            // Placeholder for download action
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#6d28d9" }}
        >
          <Download className="h-4 w-4" />
          Baixar PDF
        </button>
      </div>
    </motion.div>
  )
}

// ── Skeleton card ───────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-xl border border-white/5 p-6"
      style={{ backgroundColor: "#16161d" }}
    >
      <div className="flex flex-col items-center">
        <div className="mb-5 h-16 w-16 rounded-2xl bg-white/5" />
        <div className="mb-2 h-5 w-3/4 rounded bg-white/5" />
        <div className="mb-1 h-4 w-1/2 rounded bg-white/5" />
        <div className="mb-5 h-3 w-2/3 rounded bg-white/5" />
        <div className="h-10 w-full rounded-lg bg-white/5" />
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────

export default function CertificatesPage() {
  const {
    data: certificates,
    isLoading,
  } = useQuery<(Certificate & { course?: { title?: string } })[]>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data } = await apiClient.get("/certificates")
      return data.data ?? data
    },
  })

  return (
    <AppLayout>
      <PageHeader
        title="Meus Certificados"
        description="Certificados dos cursos concluidos"
      />

      {/* Loading */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !certificates || certificates.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "#6d28d915" }}
          >
            <Trophy className="h-8 w-8" style={{ color: "#6d28d9" }} />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Voce ainda nao possui certificados
          </h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Complete um curso para receber seu certificado.
          </p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#6d28d9" }}
          >
            <Search className="h-4 w-4" />
            Explorar Catalogo
          </Link>
        </motion.div>
      ) : (
        /* Certificate grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert, i) => (
            <CertificateCard key={cert.id} certificate={cert} index={i} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
