import { Dumbbell } from "lucide-react"
import CategoryPage from "./CategoryPage"

export default function ExerciciosExtrasPage() {
  return (
    <CategoryPage
      title="Exercícios Extras"
      description="Exercícios complementares para seu treino"
      categorySlug="exercicios-extras"
      icon={Dumbbell}
    />
  )
}
