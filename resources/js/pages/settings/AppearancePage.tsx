import { useState } from "react"
import { toast } from "sonner"
import { Palette, Check } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import PageHeader from "@/components/layout/PageHeader"

const accentColors = [
  { name: "Roxo", value: "#6d28d9" },
  { name: "Azul", value: "#2563eb" },
  { name: "Verde", value: "#059669" },
  { name: "Rosa", value: "#db2777" },
  { name: "Laranja", value: "#ea580c" },
  { name: "Vermelho", value: "#dc2626" },
  { name: "Amarelo", value: "#ca8a04" },
  { name: "Ciano", value: "#0891b2" },
]

export default function AppearancePage() {
  const [selectedColor, setSelectedColor] = useState("#6d28d9")

  function handleColorChange(color: string) {
    setSelectedColor(color)
    toast.success("Cor alterada! (Em breve será aplicado ao tema)")
  }

  return (
    <AppLayout>
      <PageHeader
        title="Aparência"
        description="Personalize a aparência da plataforma"
      />

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Accent color */}
        <div
          className="rounded-xl border border-white/5 p-6"
          style={{ backgroundColor: "#16161d" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-white">Cor de Destaque</h3>
          </div>
          <p className="mb-5 text-xs text-gray-500">
            Escolha a cor principal da interface
          </p>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className="group relative flex h-12 w-full items-center justify-center rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: color.value + "20",
                  borderColor:
                    selectedColor === color.value
                      ? color.value
                      : "transparent",
                }}
                title={color.name}
              >
                <div
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
                {selectedColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div
          className="rounded-xl border border-white/5 p-6"
          style={{ backgroundColor: "#16161d" }}
        >
          <h3 className="mb-4 text-sm font-semibold text-white">Preview</h3>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: selectedColor }}
            >
              Botão Primário
            </button>
            <button
              className="rounded-lg border px-4 py-2 text-sm font-medium"
              style={{ borderColor: selectedColor, color: selectedColor }}
            >
              Botão Secundário
            </button>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: selectedColor + "20",
                color: selectedColor,
              }}
            >
              Badge
            </span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full"
              style={{ backgroundColor: selectedColor, width: "65%" }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
