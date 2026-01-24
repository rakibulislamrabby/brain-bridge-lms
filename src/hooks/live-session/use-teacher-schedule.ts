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

export interface ScheduleTime {
  id: number
  start_time: string
  end_time: string
  meeting_link: string | null
  is_booked: number
  booked_count: number
}

export interface ScheduleDay {
  date: string
  day: string
  slots: ScheduleTime[]
}

export interface TeacherScheduleResponse {
  success: boolean
  data: ScheduleDay[]
}

const fetchTeacherSchedule = async (id: number): Promise<ScheduleDay[]> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid slot id provided')
  }

  const url = joinUrl(`teacher/getSchedule/${id}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch schedule (${response.status})`
      throw new Error(errorMessage)
    }

    if (result?.success && Array.isArray(result.data)) {
      return result.data
    }

    return []
  } catch (error) {
    console.error('Fetch schedule error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch schedule')
  }
}

export const useTeacherSchedule = (id: number) => {
  return useQuery({
    queryKey: ['teacher-schedule', id],
    queryFn: () => fetchTeacherSchedule(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 60 * 1000,
  })
}
