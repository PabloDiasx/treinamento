import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AuthProvider, useAuth } from "@/hooks/useAuth"

// Auth pages are eager (needed immediately on first load)
import AuthPage from "@/pages/AuthPage"

// All other pages lazy-loaded — quebra o bundle por rota
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"))
const ManageCoursesPage = lazy(() => import("@/pages/admin/ManageCoursesPage"))
const CourseEditorPage = lazy(() => import("@/pages/admin/CourseEditorPage"))
const ManageCategoriesPage = lazy(() => import("@/pages/admin/ManageCategoriesPage"))
const ManageNewsPage = lazy(() => import("@/pages/admin/ManageNewsPage"))
const ManageUsersPage = lazy(() => import("@/pages/admin/ManageUsersPage"))
const CourseCatalog = lazy(() => import("@/pages/CourseCatalog"))
const CourseDetail = lazy(() => import("@/pages/CourseDetail"))
const MyCoursesPage = lazy(() => import("@/pages/MyCoursesPage"))
const VideoFeedPage = lazy(() => import("@/pages/VideoFeedPage"))
const EbookViewer = lazy(() => import("@/pages/EbookViewer"))
const CertificatesPage = lazy(() => import("@/pages/CertificatesPage"))
const ProfilePage = lazy(() => import("@/pages/settings/ProfilePage"))
const SecurityPage = lazy(() => import("@/pages/settings/SecurityPage"))
const NotificationsPage = lazy(() => import("@/pages/settings/NotificationsPage"))
const AppearancePage = lazy(() => import("@/pages/settings/AppearancePage"))
const ComoManusearPage = lazy(() => import("@/pages/categories/ComoManusearPage"))
const EbooksPage = lazy(() => import("@/pages/categories/EbooksPage"))
const ExerciciosAcessoriosPage = lazy(() => import("@/pages/categories/ExerciciosAcessoriosPage"))
const ExerciciosExtrasPage = lazy(() => import("@/pages/categories/ExerciciosExtrasPage"))
const ManuaisPage = lazy(() => import("@/pages/categories/ManuaisPage"))
const VideosExerciciosPage = lazy(() => import("@/pages/categories/VideosExerciciosPage"))
const VideosMontagensPage = lazy(() => import("@/pages/categories/VideosMontagensPage"))
const NotFound = lazy(() => import("@/pages/NotFound"))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
})

function FullscreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <FullscreenSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <FullscreenSpinner />

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || ""}>
        <AuthProvider>
          <Suspense fallback={<FullscreenSpinner />}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

              {/* Categorias */}
              <Route path="/como-manusear" element={<ProtectedRoute><ComoManusearPage /></ProtectedRoute>} />
              <Route path="/ebooks" element={<ProtectedRoute><EbooksPage /></ProtectedRoute>} />
              <Route path="/exercicios-acessorios" element={<ProtectedRoute><ExerciciosAcessoriosPage /></ProtectedRoute>} />
              <Route path="/exercicios-extras" element={<ProtectedRoute><ExerciciosExtrasPage /></ProtectedRoute>} />
              <Route path="/manuais" element={<ProtectedRoute><ManuaisPage /></ProtectedRoute>} />
              <Route path="/videos-exercicios" element={<ProtectedRoute><VideosExerciciosPage /></ProtectedRoute>} />
              <Route path="/videos-montagens" element={<ProtectedRoute><VideosMontagensPage /></ProtectedRoute>} />

              <Route path="/catalog" element={<ProtectedRoute><CourseCatalog /></ProtectedRoute>} />
              <Route path="/courses/:slug" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/courses/:slug/learn/:lessonId?" element={<ProtectedRoute><VideoFeedPage /></ProtectedRoute>} />
              <Route path="/my-courses" element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />
              <Route path="/ebooks/:ebookId" element={<ProtectedRoute><EbookViewer /></ProtectedRoute>} />
              <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/courses" element={<ProtectedRoute><ManageCoursesPage /></ProtectedRoute>} />
              <Route path="/admin/courses/new" element={<ProtectedRoute><CourseEditorPage /></ProtectedRoute>} />
              <Route path="/admin/courses/:id/edit" element={<ProtectedRoute><CourseEditorPage /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute><ManageCategoriesPage /></ProtectedRoute>} />
              <Route path="/admin/news" element={<ProtectedRoute><ManageNewsPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><ManageUsersPage /></ProtectedRoute>} />

              {/* Settings */}
              <Route path="/settings/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
              <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/settings/appearance" element={<ProtectedRoute><AppearancePage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster theme="dark" position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
