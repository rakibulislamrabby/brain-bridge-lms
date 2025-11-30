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
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export interface StudentInfo {
  id: number
  name: string
  email: string
  phone: string
  profile_picture?: string | null
  [key: string]: unknown
}

export interface CourseRequestWithStudent {
  id: number
  student_id: number
  course_name: string
  course_description: string
  subject: string
  additional_note: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  created_at: string
  updated_at: string
  student: StudentInfo
}

export interface PaginatedCourseRequests {
  current_page: number
  data: CourseRequestWithStudent[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

const fetchCourseRequests = async (page: number = 1): Promise<PaginatedCourseRequests> => {
  const url = `${joinUrl('course-requests')}?page=${page}`
  const headers = getAuthHeaders()

  console.log('🔵 Fetching course requests from:', url)

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  const text = await response.text()
  console.log('🔵 Course Requests Response Status:', response.status)
  console.log('🔵 Course Requests Response Text:', text.substring(0, 500))

  let result: unknown = {}
  try {
    result = text ? JSON.parse(text) : {}
  } catch (parseError) {
    console.error('🔴 JSON Parse Error:', parseError)
    throw new Error('Invalid response from server')
  }

  if (!response.ok) {
    const errorObj = result as Record<string, unknown>
    const errorMessage =
      errorObj?.message ||
      errorObj?.error ||
      `Failed to fetch course requests (${response.status})`
    console.error('🔴 Course Requests Error:', errorMessage)
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch course requests')
  }

  console.log('🔵 Course Requests Parsed Data:', result)
  
  // The API returns the paginated structure directly, so we can return it as-is
  const paginatedData = result as PaginatedCourseRequests
  
  // Validate that we have the expected structure
  if (!paginatedData || typeof paginatedData !== 'object') {
    console.error('🔴 Invalid response structure:', paginatedData)
    throw new Error('Invalid response format from server')
  }

  console.log('✅ Successfully parsed course requests:', paginatedData.data?.length || 0, 'requests')
  return paginatedData
}

export const useCourseRequests = (page: number = 1) => {
  return useQuery({
    queryKey: ['course-requests', page],
    queryFn: () => fetchCourseRequests(page),
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  })
}

