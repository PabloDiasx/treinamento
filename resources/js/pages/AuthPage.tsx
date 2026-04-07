import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import type { ApiError } from "@/types"
import { AxiosError } from "axios"

// ── Schemas ──────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail e obrigatorio")
    .email("Informe um e-mail valido"),
  password: z.string().min(1, "A senha e obrigatoria"),
})

const registerSchema = z
  .object({
    name: z.string().min(1, "O nome e obrigatorio"),
    email: z
      .string()
      .min(1, "O e-mail e obrigatorio")
      .email("Informe um e-mail valido"),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres"),
    password_confirmation: z
      .string()
      .min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "As senhas nao coincidem",
    path: ["password_confirmation"],
  })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

// ── Input component ──────────────────────────────────────────

function InputField({
  icon: Icon,
  type = "text",
  error,
  ...props
}: {
  icon: typeof Mail
  type?: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"

  return (
    <div className="space-y-1">
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          {...props}
          type={isPassword && showPassword ? "text" : type}
          className={cn(
            "w-full rounded-lg border border-border bg-secondary py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            error && "border-destructive focus:ring-destructive",
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

// ── Login form ───────────────────────────────────────────────

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginValues) {
    try {
      await login(values.email, values.password)
      toast.success("Login realizado com sucesso!")
      navigate("/dashboard")
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      const message =
        axiosErr.response?.data?.message || "Erro ao fazer login. Tente novamente."
      toast.error(message)
    }
  }

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Entrar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse sua conta para continuar aprendendo
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">E-mail</label>
          <InputField
            icon={Mail}
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Senha</label>
          <InputField
            icon={Lock}
            type="password"
            placeholder="Sua senha"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-primary hover:text-accent transition-colors"
          >
            Esqueci minha senha
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Nao tem uma conta?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-primary hover:text-accent transition-colors"
        >
          Criar conta
        </button>
      </p>
    </motion.div>
  )
}

// ── Register form ────────────────────────────────────────────

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(values: RegisterValues) {
    try {
      await registerUser(
        values.name,
        values.email,
        values.password,
        values.password_confirmation,
      )
      toast.success("Conta criada com sucesso!")
      navigate("/dashboard")
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>
      const message =
        axiosErr.response?.data?.message || "Erro ao criar conta. Tente novamente."
      toast.error(message)
    }
  }

  return (
    <motion.div
      key="register"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Criar conta</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre-se para comecar seus treinamentos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Nome</label>
          <InputField
            icon={User}
            placeholder="Seu nome completo"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">E-mail</label>
          <InputField
            icon={Mail}
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Senha</label>
          <InputField
            icon={Lock}
            type="password"
            placeholder="Minimo 8 caracteres"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">
            Confirmar senha
          </label>
          <InputField
            icon={Lock}
            type="password"
            placeholder="Repita sua senha"
            autoComplete="new-password"
            error={errors.password_confirmation?.message}
            {...register("password_confirmation")}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ja tem uma conta?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-primary hover:text-accent transition-colors"
        >
          Entrar
        </button>
      </p>
    </motion.div>
  )
}

// ── Auth page ────────────────────────────────────────────────

export default function AuthPage() {
  const location = useLocation()
  const isRegisterRoute = location.pathname === "/register"
  const [isRegister, setIsRegister] = useState(isRegisterRoute)

  return (
    <div className="flex min-h-screen bg-background isolate">
      {/* Left side — brand / illustration (hidden on mobile) */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center pointer-events-none select-none">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />

        {/* Decorative floating circles */}
        <div className="absolute left-[10%] top-[15%] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[20%] right-[15%] h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[40%] left-[30%] h-32 w-32 rounded-full bg-primary/5 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-sm">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Treinamento</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Sua plataforma de cursos e treinamentos
          </p>

          {/* Feature highlights */}
          <div className="mt-12 space-y-4 text-left">
            {[
              "Cursos completos com video e material de apoio",
              "Acompanhe seu progresso em tempo real",
              "Certificados ao concluir seus treinamentos",
              "Assistente IA para tirar suas duvidas",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[480px] lg:shrink-0 lg:border-l lg:border-border lg:bg-card/50">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">Treinamento</span>
        </div>

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {isRegister ? (
              <RegisterForm
                key="register"
                onSwitch={() => setIsRegister(false)}
              />
            ) : (
              <LoginForm
                key="login"
                onSwitch={() => setIsRegister(true)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
