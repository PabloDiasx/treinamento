import { FileText } from "lucide-react"
import CategoryPage from "./CategoryPage"

export default function ManuaisPage() {
  return (
    <CategoryPage
      title="Manuais"
      description="Manuais técnicos e guias de referência"
      categorySlug="manuais"
      icon={FileText}
    />
  )
}
