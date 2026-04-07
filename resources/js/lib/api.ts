import axios from "axios"

const BASE = import.meta.env.VITE_API_BASE || "/treinamento/public"

export const apiClient = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

let csrfInitialized = false

export async function getCsrfCookie(): Promise<void> {
  await axios.get(`${BASE}/sanctum/csrf-cookie`, { withCredentials: true })
  csrfInitialized = true
}

// Request interceptor: ensure CSRF cookie is set before the first request
apiClient.interceptors.request.use(async (config) => {
  if (!csrfInitialized) {
    await getCsrfCookie()
  }
  return config
})

// Response interceptor: handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status

    // 401 Unauthorized — let React Router handle redirect
    if (status === 401) {
      return Promise.reject(error)
    }

    // 419 CSRF token mismatch — refresh token and retry once
    if (status === 419) {
      try {
        await getCsrfCookie()
        return apiClient.request(error.config)
      } catch {
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)
