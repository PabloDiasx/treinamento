import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AuthProvider, useAuth } from "@/hooks/useAuth"
import AuthPage from "@/pages/AuthPage"
import DashboardPage from "@/pages/DashboardPage"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import ManageCoursesPage from "@/pages/admin/ManageCoursesPage"
import CourseEditorPage from "@/pages/admin/CourseEditorPage"
import ManageCategoriesPage from "@/pages/admin/ManageCategoriesPage"
import ManageUsersPage from "@/pages/admin/ManageUsersPage"
import CourseCatalog from "@/pages/CourseCatalog"
import CourseDetail from "@/pages/CourseDetail"
import MyCoursesPage from "@/pages/MyCoursesPage"
import VideoFeedPage from "@/pages/VideoFeedPage"
import EbookViewer from "@/pages/EbookViewer"
import CertificatesPage from "@/pages/CertificatesPage"
import ProfilePage from "@/pages/settings/ProfilePage"
import SecurityPage from "@/pages/settings/SecurityPage"
import NotificationsPage from "@/pages/settings/NotificationsPage"
import AppearancePage from "@/pages/settings/AppearancePage"
import ComoManusearPage from "@/pages/categories/ComoManusearPage"
import EbooksPage from "@/pages/categories/EbooksPage"
import ExerciciosAcessoriosPage from "@/pages/categories/ExerciciosAcessoriosPage"
import ExerciciosExtrasPage from "@/pages/categories/ExerciciosExtrasPage"
import ManuaisPage from "@/pages/categories/ManuaisPage"
import VideosExerciciosPage from "@/pages/categories/VideosExerciciosPage"
import VideosMontagensPage from "@/pages/categories/VideosMontagensPage"
import NotFound from "@/pages/NotFound"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// ── Protected route wrapper ──────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// ── Redirect root based on auth state ────────────────────────

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
}

// ── App ──────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || ""}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Categorias */}
            <Route path="/como-manusear" element={<ProtectedRoute><ComoManusearPage /></ProtectedRoute>} />
            <Route path="/ebooks" element={<ProtectedRoute><EbooksPage /></ProtectedRoute>} />
            <Route path="/exercicios-acessorios" element={<ProtectedRoute><ExerciciosAcessoriosPage /></ProtectedRoute>} />
            <Route path="/exercicios-extras" element={<ProtectedRoute><ExerciciosExtrasPage /></ProtectedRoute>} />
            <Route path="/manuais" element={<ProtectedRoute><ManuaisPage /></ProtectedRoute>} />
            <Route path="/videos-exercicios" element={<ProtectedRoute><VideosExerciciosPage /></ProtectedRoute>} />
            <Route path="/videos-montagens" element={<ProtectedRoute><VideosMontagensPage /></ProtectedRoute>} />
            <Route
              path="/catalog"
              element={
                <ProtectedRoute>
                  <CourseCatalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug/learn/:lessonId?"
              element={
                <ProtectedRoute>
                  <VideoFeedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <MyCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ebooks/:ebookId"
              element={
                <ProtectedRoute>
                  <EbookViewer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <CertificatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute>
                  <ManageCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses/new"
              element={
                <ProtectedRoute>
                  <CourseEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses/:id/edit"
              element={
                <ProtectedRoute>
                  <CourseEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <ManageCategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            {/* Settings */}
            <Route
              path="/settings/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/security"
              element={
                <ProtectedRoute>
                  <SecurityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/appearance"
              element={
                <ProtectedRoute>
                  <AppearancePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster theme="dark" position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
