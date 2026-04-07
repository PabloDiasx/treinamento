import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { apiClient, getCsrfCookie } from "@/lib/api"
import type { User } from "@/types"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
  ) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already authenticated on mount
  useEffect(() => {
    apiClient
      .get<User>("/user")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await getCsrfCookie()
    await apiClient.post("/login", { email, password })
    const { data } = await apiClient.get<User>("/user")
    setUser(data)
  }, [])

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      password_confirmation: string,
    ) => {
      await getCsrfCookie()
      await apiClient.post("/register", {
        name,
        email,
        password,
        password_confirmation,
      })
      const { data } = await apiClient.get<User>("/user")
      setUser(data)
    },
    [],
  )

  const logout = useCallback(async () => {
    await apiClient.post("/logout")
    setUser(null)
  }, [])

  return (
    <AuthContext value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
