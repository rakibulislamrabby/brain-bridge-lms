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

export interface TeacherBySkill {
  id: number
  user_id: number
  name: string
  email: string
  profile_picture?: string | null
  bio?: string | null
  title: string
  average_rating: number
  total_sessions: number
  base_pay: string
  teacher_level?: TeacherLevel
  skills?: TeacherSkill[]
}

interface TeachersBySkillResponse {
  teachers?: TeacherBySkill[]
  data?: TeacherBySkill[]
  [key: string]: unknown
}

const fetchTeachersBySkill = async (skillId: number): Promise<TeacherBySkill[]> => {
  if (!Number.isFinite(skillId) || skillId <= 0) {
    throw new Error('Invalid skill ID provided')
  }

  const url = joinUrl(`teachers?skill_id=${skillId}`)
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

    const responseData = result as TeachersBySkillResponse
    
    // Handle different response formats
    if (Array.isArray(result)) {
      return result as TeacherBySkill[]
    } else if (responseData.teachers && Array.isArray(responseData.teachers)) {
      return responseData.teachers
    } else if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data
    }

    return []
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch teachers')
  }
}

export const useTeachersBySkill = (skillId: number | null) => {
  return useQuery({
    queryKey: ['teachers-by-skill', skillId],
    queryFn: () => fetchTeachersBySkill(skillId!),
    enabled: Number.isFinite(skillId) && skillId !== null && skillId > 0,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  })
}

