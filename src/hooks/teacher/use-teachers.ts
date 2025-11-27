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

export interface TeacherSkill {
  id: number
  name: string
  subject_id: number
  pivot?: {
    teacher_id: number
    skill_id: number
    years_of_experience: number
  }
}

export interface TeacherLevel {
  id: number
  level_name: string
  min_rating: number
  benefits: string
}

export interface Teacher {
  id: number
  name: string
  email: string
  phone?: string | null
  profile_picture?: string | null
  bio?: string | null
  teacher?: {
    id: number
    user_id: number
    title: string
    base_pay: string
    total_sessions: number
    average_rating: number
    teacher_level?: TeacherLevel
    skills?: TeacherSkill[]
  }
}

interface TeachersResponse {
  success?: boolean
  teachers?: Teacher[]
  data?: Teacher[] | {
    current_page?: number
    data?: Teacher[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

const fetchAllTeachers = async (): Promise<Teacher[]> => {
  const url = joinUrl('teachers')
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch teachers (${response.status})`
      throw new Error(errorMessage)
    }

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format')
    }

    const responseData = result as TeachersResponse
    
    // Handle different response formats
    // Case 1: Paginated response: { success: true, data: { current_page: 1, data: [...] } }
    if (responseData.success && responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
      const paginatedData = responseData.data as { data?: Teacher[]; [key: string]: unknown }
      if (paginatedData.data && Array.isArray(paginatedData.data)) {
        console.log('✅ Parsed paginated teachers response:', paginatedData.data.length, 'teachers')
        return paginatedData.data as Teacher[]
      }
    }
    
    // Case 2: Direct array response: { success: true, data: [...] }
    if (responseData.success && responseData.data && Array.isArray(responseData.data)) {
      console.log('✅ Parsed direct teachers array:', responseData.data.length, 'teachers')
      return responseData.data as Teacher[]
    }
    
    // Case 3: Simple array response: [...]
    if (Array.isArray(result)) {
      console.log('✅ Parsed simple array response:', result.length, 'teachers')
      return result as Teacher[]
    }
    
    // Case 4: Teachers property: { teachers: [...] }
    if (responseData.teachers && Array.isArray(responseData.teachers)) {
      console.log('✅ Parsed teachers property:', responseData.teachers.length, 'teachers')
      return responseData.teachers
    }

    console.warn('⚠️ Could not parse teachers response:', result)
    return []
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch teachers')
  }
}

export const useTeachers = () => {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: fetchAllTeachers,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  })
}

