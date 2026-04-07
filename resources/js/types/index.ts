// ── Entity Types ──────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  role: string
  avatar_url: string | null
  bio: string | null
  is_active: boolean
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
}

export interface Course {
  id: number
  instructor_id: number
  category_id: number | null
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_path: string | null
  video_url: string | null
  video_source: string | null
  video_path: string | null
  status: string
  difficulty: string
  estimated_hours: number | null
  is_featured: boolean
  published_at: string | null
  created_at: string
  instructor?: User
  category?: Category
  modules?: Module[]
  videos?: CourseVideo[]
}

export interface Module {
  id: number
  course_id: number
  title: string
  description: string | null
  sort_order: number
  lessons?: Lesson[]
}

export interface Lesson {
  id: number
  module_id: number
  title: string
  slug: string
  type: string
  content_url: string | null
  video_source: string | null
  content_text: string | null
  duration_seconds: number | null
  sort_order: number
  is_free_preview: boolean
  ebook?: Ebook
}

export interface Ebook {
  id: number
  lesson_id: number
  title: string
  file_path: string
  file_size_bytes: number
  page_count: number | null
  ai_summary: string | null
  summary_status: string
  summarized_at: string | null
}

export interface CourseVideo {
  id: number
  course_id: number
  title: string
  video_url: string | null
  video_source: string | null
  video_path: string | null
  tag: string
  sort_order: number
  created_at: string
}

export interface Enrollment {
  id: number
  user_id: number
  course_id: number
  status: string
  enrolled_at: string
  completed_at: string | null
  course?: Course
}

export interface LessonProgress {
  id: number
  user_id: number
  lesson_id: number
  status: string
  progress_pct: number
  last_position: number | null
  started_at: string | null
  completed_at: string | null
}

export interface AiChatMessage {
  id: number
  user_id: number
  context_type: string
  context_id: number
  role: string
  content: string
  tokens_used: number | null
  created_at: string
}

export interface Certificate {
  id: number
  user_id: number
  course_id: number
  certificate_code: string
  file_path: string
  issued_at: string
}

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  body: string
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

// ── Pagination ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginationParams {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  direction?: "asc" | "desc"
}

export interface CourseFilters extends PaginationParams {
  category_id?: number
  status?: string
  difficulty?: string
}

export interface AdminCourseFilters extends PaginationParams {
  status?: string
}

export interface UserFilters extends PaginationParams {
  role?: string
}

export interface DashboardData {
  total_courses: number
  total_enrollments: number
  completed_courses: number
  progress_pct: number
  recent_courses: Course[]
}

export interface AdminDashboardData {
  total_users: number
  total_courses: number
  total_enrollments: number
  total_certificates: number
  recent_enrollments: Enrollment[]
  popular_courses: Course[]
}

// ── Form Types ───────────────────────────────────────────────

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  password_confirmation: string
}

// ── API Types ────────────────────────────────────────────────

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
