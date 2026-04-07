import { Video } from "lucide-react"
import CategoryPage from "./CategoryPage"

export default function VideosExerciciosPage() {
  return (
    <CategoryPage
      title="Vídeos de Exercícios"
      description="Vídeos demonstrativos de exercícios"
      categorySlug="videos-de-exercicios"
      icon={Video}
    />
  )
}
