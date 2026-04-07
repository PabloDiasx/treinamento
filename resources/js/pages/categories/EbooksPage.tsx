import { BookOpen } from "lucide-react"
import CategoryPage from "./CategoryPage"

export default function EbooksPage() {
  return (
    <CategoryPage
      title="Ebooks"
      description="Materiais de leitura e estudo"
      categorySlug="ebooks"
      icon={BookOpen}
    />
  )
}
