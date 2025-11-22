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

export interface LiveSessionDetailTeacher {
  id: number
  name: string
  email?: string
}

export interface LiveSessionDetailSubject {
  id: number
  name: string
}

export interface LiveSessionDetailResponse {
  id: number
  title: string
  teacher: LiveSessionDetailTeacher
  subject: LiveSessionDetailSubject
  subject_id: number
  from_date: string
  to_date: string
  start_time: string
  end_time: string
  type: string
  price: string
  description: string
  available_seats: number
}

const fetchLiveSessionDetail = async (id: number): Promise<LiveSessionDetailResponse> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid live session id provided')
  }

  const url = joinUrl(`slots/${id}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch live session (${response.status})`
      throw new Error(errorMessage)
    }

    if (!result || typeof result !== 'object') {
      throw new Error('Live session not found')
    }

    return result as LiveSessionDetailResponse
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch live session')
  }
}

export const useLiveSessionDetail = (id: number) => {
  return useQuery({
    queryKey: ['live-session', id],
    queryFn: () => fetchLiveSessionDetail(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 60 * 1000,
  })
}
