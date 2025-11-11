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

export interface LiveSessionSubject {
  id: number
  name: string
}

export interface LiveSessionTeacher {
  id: number
  name: string
  email?: string
}

export interface LiveSessionSlot {
  id: number
  teacher: LiveSessionTeacher
  subject: LiveSessionSubject
  date: string
  time: string
  available_seats: number
}

const normalizeSlots = (result: any): LiveSessionSlot[] => {
  if (!result) {
    return []
  }

  if (Array.isArray(result)) {
    return result as LiveSessionSlot[]
  }

  if (Array.isArray(result?.slots)) {
    return result.slots as LiveSessionSlot[]
  }

  return []
}

const fetchLiveSessions = async (): Promise<LiveSessionSlot[]> => {
  const url = joinUrl('slots')
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch live sessions (${response.status})`
      throw new Error(errorMessage)
    }

    return normalizeSlots(result)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch live sessions')
  }
}

export const useLiveSessions = () => {
  return useQuery({
    queryKey: ['live-sessions'],
    queryFn: fetchLiveSessions,
    staleTime: 60 * 1000,
  })
}
