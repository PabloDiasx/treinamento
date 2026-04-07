import { Video } from "lucide-react"
import CategoryPage from "./CategoryPage"

export default function VideosMontagensPage() {
  return (
    <CategoryPage
      title="Vídeos de Montagens"
      description="Vídeos de montagem e instalação dos equipamentos"
      categorySlug="videos-de-montagens"
      icon={Video}
    />
  )
}
