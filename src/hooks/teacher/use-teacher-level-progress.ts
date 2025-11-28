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

export interface TeacherLevel {
  id: number
  name: string
  benefits: string
}

export interface Requirement {
  name: string
  key: string
  current: number
  required: number
  progress_percent: number
  is_met: boolean
}

export interface TeacherLevelProgressResponse {
  current_level: TeacherLevel
  next_level: TeacherLevel | null
  progress_percent: number
  is_max_level: boolean
  requirements: Requirement[]
  message: string
}

const fetchTeacherLevelProgress = async (): Promise<TeacherLevelProgressResponse> => {
  const url = joinUrl('teacher-levels/progress')
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch teacher level progress (${response.status})`
      throw new Error(errorMessage)
    }

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format')
    }

    return result as TeacherLevelProgressResponse
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch teacher level progress')
  }
}

export const useTeacherLevelProgress = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['teacher-level-progress'],
    queryFn: fetchTeacherLevelProgress,
    enabled,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  })
}

