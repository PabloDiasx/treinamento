import { Dumbbell } from "lucide-react"
import CategoryPage from "./CategoryPage"

export default function ExerciciosAcessoriosPage() {
  return (
    <CategoryPage
      title="Exercícios com Acessórios"
      description="Exercícios utilizando acessórios dos equipamentos"
      categorySlug="exercicios-com-acessorios"
      icon={Dumbbell}
    />
  )
}
