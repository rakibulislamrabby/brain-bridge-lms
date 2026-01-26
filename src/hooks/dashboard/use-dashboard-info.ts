import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || ''

const joinUrl = (path: string) => {
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path
  if (!API_BASE_URL) {
    return `/${trimmedPath}`
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  return `${base}/${trimmedPath}`
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export interface LatestTransaction {
  id: number
  course_id: number
  student_id: number
  teacher_id: number
  enrolled_at: string
  amount_paid: string
  currency: string
  payment_status: string
  payment_intent_id: string
  payment_method: string
  paid_at: string
  status: string
  progress_percentage: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface AdminDashboardInfo {
  totalTeacher: number
  totalStudent: number
  enrolledCourses: number
  enrolledCoursesEarning: string
  latestTranscation: LatestTransaction[]
  totalCourse: number
  totalSessions: number
}

export interface LatestCourse {
  id: number
  teacher_id: number
  subject_id: number
  title: string
  description: string
  thumbnail_url: string
  old_price: string
  price: string
  is_published: number
  is_main: number
  enrollment_count: number
  processing_status: string
  created_at: string
  updated_at: string
}

export interface TeacherDashboardInfo {
  myCourses: number
  enrolledCoursesEarning: string
  latestCourse: LatestCourse[]
}

export interface LatestCourseRequest {
  // To be defined when course request structure is provided
  [key: string]: any
}

export interface StudentDashboardInfo {
  enrolledCourses: number
  courserequest: number
  latestcourserequest: LatestCourseRequest[]
}

export type DashboardInfo = AdminDashboardInfo | TeacherDashboardInfo | StudentDashboardInfo

const fetchDashboardInfo = async (): Promise<DashboardInfo> => {
  const url = joinUrl('dashboard')
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    let result: any = {}

    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('Failed to parse dashboard response:', parseError)
      throw new Error('Invalid response format from server')
    }

    if (!response.ok) {
      const errorMessage =
        result?.message || result?.error || `Failed to fetch dashboard info (${response.status})`
      throw new Error(errorMessage)
    }

    return result as DashboardInfo
  } catch (error) {
    console.error('Fetch dashboard info error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch dashboard info')
  }
}

// Type guard functions
export const isAdminDashboardInfo = (data: any): data is AdminDashboardInfo => {
  return data && 'totalTeacher' in data && 'totalStudent' in data
}

export const isTeacherDashboardInfo = (data: any): data is TeacherDashboardInfo => {
  return data && 'myCourses' in data && 'enrolledCoursesEarning' in data
}

export const isStudentDashboardInfo = (data: any): data is StudentDashboardInfo => {
  return data && 'enrolledCourses' in data && 'courserequest' in data
}

export const useDashboardInfo = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['dashboard-info'],
    queryFn: fetchDashboardInfo,
    enabled,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  })
}
