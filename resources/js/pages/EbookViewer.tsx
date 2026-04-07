import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
  BookOpen,
  RefreshCw,
  FileText,
  Sparkles,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import type { Ebook } from "@/types"

const BASE = import.meta.env.VITE_API_BASE || "/treinamento/public"

// ── Mobile tab type ────────────────────────────────────────────

type MobileTab = "document" | "summary"

// ── Main component ─────────────────────────────────────────────

export default function EbookViewer() {
  const { ebookId } = useParams<{ ebookId: string }>()
  const navigate = useNavigate()
  const [mobileTab, setMobileTab] = useState<MobileTab>("document")

  const {
    data: ebook,
    isLoading,
    isError,
    refetch,
  } = useQuery<Ebook>({
    queryKey: ["ebook", ebookId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/ebooks/${ebookId}`)
      return data
    },
    enabled: !!ebookId,
  })

  const downloadUrl = `${BASE}/api/ebooks/${ebookId}/download`

  const handleDownload = () => {
    window.open(downloadUrl, "_blank")
  }

  const handleBack = () => {
    navigate(-1)
  }

  // ── Loading state ──────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className="flex h-[100dvh] w-full items-center justify-center"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-sm text-gray-400">Carregando ebook...</p>
        </motion.div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────

  if (isError || !ebook) {
    return (
      <div
        className="flex h-[100dvh] w-full items-center justify-center"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 px-6 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            Ebook nao encontrado
          </h2>
          <p className="text-sm text-gray-400">
            O ebook solicitado nao existe ou voce nao tem acesso.
          </p>
          <button
            onClick={handleBack}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Summary panel content ──────────────────────────────────

  function renderSummary() {
    if (!ebook) return null

    // Has a completed summary
    if (ebook.ai_summary) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/5 p-5"
          style={{ backgroundColor: "#16161d" }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#6d28d920" }}
            >
              <BookOpen className="h-5 w-5" style={{ color: "#6d28d9" }} />
            </div>
            <h3 className="text-base font-semibold text-white">
              Resumo por IA
            </h3>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {ebook.ai_summary}
          </p>
        </motion.div>
      )
    }

    // Pending
    if (ebook.summary_status === "pending") {
      return (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <div>
            <p className="text-sm font-medium text-white">
              Resumo sendo gerado...
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Isso pode levar alguns minutos.
            </p>
          </div>
        </div>
      )
    }

    // Processing
    if (ebook.summary_status === "processing") {
      return (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <div>
            <p className="text-sm font-medium text-white">
              Processando resumo...
            </p>
            <p className="mt-1 text-xs text-gray-500">
              A IA esta analisando o documento.
            </p>
          </div>
        </div>
      )
    }

    // Failed
    if (ebook.summary_status === "failed") {
      return (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Resumo indisponivel
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Nao foi possivel gerar o resumo deste ebook.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#6d28d9" }}
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      )
    }

    // No summary at all
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Sparkles className="h-8 w-8 text-gray-600" />
        <p className="text-sm text-gray-500">
          Nenhum resumo disponivel para este ebook.
        </p>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────

  return (
    <div
      className="flex h-[100dvh] w-full flex-col"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-white/5 px-4"
        style={{ backgroundColor: "#16161d" }}
      >
        <button
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center">
          <h1 className="truncate text-sm font-semibold text-white">
            {ebook.title}
          </h1>
        </div>

        <button
          onClick={handleDownload}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Baixar"
        >
          <Download className="h-5 w-5" />
        </button>
      </motion.header>

      {/* Mobile tabs */}
      <div
        className="flex flex-shrink-0 border-b border-white/5 lg:hidden"
        style={{ backgroundColor: "#16161d" }}
      >
        <button
          onClick={() => setMobileTab("document")}
          className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors"
          style={{
            color: mobileTab === "document" ? "#ffffff" : "#6b7280",
            borderBottom:
              mobileTab === "document" ? "2px solid #6d28d9" : "2px solid transparent",
          }}
        >
          <FileText className="h-4 w-4" />
          Documento
        </button>
        <button
          onClick={() => setMobileTab("summary")}
          className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors"
          style={{
            color: mobileTab === "summary" ? "#ffffff" : "#6b7280",
            borderBottom:
              mobileTab === "summary" ? "2px solid #6d28d9" : "2px solid transparent",
          }}
        >
          <Sparkles className="h-4 w-4" />
          Resumo IA
        </button>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF viewer panel - desktop always, mobile only on document tab */}
        <div
          className={`flex-1 ${mobileTab === "document" ? "block" : "hidden"} lg:block`}
        >
          <iframe
            src={downloadUrl}
            title={ebook.title}
            className="h-full w-full border-0"
            style={{ backgroundColor: "#1a1a24" }}
          />
        </div>

        {/* Summary panel - desktop always, mobile only on summary tab */}
        <div
          className={`w-full overflow-y-auto border-l border-white/5 p-5 lg:w-96 lg:flex-shrink-0 ${mobileTab === "summary" ? "block" : "hidden"} lg:block`}
          style={{ backgroundColor: "#0a0a0f" }}
        >
          {renderSummary()}
        </div>
      </div>
    </div>
  )
}
