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

export interface InPersonScheduleSlot {
  id: number
  day_id?: number
  in_person_slot_day_id?: number
  start_time: string
  end_time: string
  is_booked: number
  booked_count: number | null
}

export interface InPersonScheduleDay {
  date: string
  day: string
  day_id?: number
  slots: InPersonScheduleSlot[]
}

export interface InPersonScheduleResponse {
  success: boolean
  data: InPersonScheduleDay[]
}

const fetchInPersonSchedule = async (id: number): Promise<InPersonScheduleDay[]> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid slot id provided')
  }

  const url = joinUrl(`teacher/in-person/getSchedule/${id}`)
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
    console.error('Fetch in-person schedule error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch schedule')
  }
}

export const useInPersonSchedule = (id: number) => {
  return useQuery({
    queryKey: ['in-person-schedule', id],
    queryFn: () => fetchInPersonSchedule(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 60 * 1000,
  })
}
