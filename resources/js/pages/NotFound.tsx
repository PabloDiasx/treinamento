import { Link } from "react-router-dom"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        Pagina nao encontrada
      </p>
      <p className="mt-2 text-muted-foreground">
        A pagina que voce esta procurando nao existe ou foi movida.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
      >
        <Home className="h-4 w-4" />
        Voltar ao inicio
      </Link>
    </div>
  )
}
