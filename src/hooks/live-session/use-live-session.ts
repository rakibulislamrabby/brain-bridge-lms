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
  title?: string
  teacher: LiveSessionTeacher
  subject: LiveSessionSubject
  date?: string
  from_date?: string
  to_date?: string
  time?: string
  available_seats?: number
  type?: string
  price?: string
  description?: string
}

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface PaginatedSlotsResponse {
  current_page: number
  data: LiveSessionSlot[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export interface LiveSessionsResponse {
  slots: PaginatedSlotsResponse
}

const fetchLiveSessions = async (page: number = 1): Promise<PaginatedSlotsResponse> => {
  const url = joinUrl(`slots?page=${page}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result: LiveSessionsResponse | any = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch live sessions (${response.status})`
      throw new Error(errorMessage)
    }

    // Handle paginated response
    if (result?.slots) {
      return result.slots as PaginatedSlotsResponse
    }

    // Fallback for non-paginated response
    if (Array.isArray(result)) {
      return {
        current_page: 1,
        data: result as LiveSessionSlot[],
        first_page_url: '',
        from: 1,
        last_page: 1,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        per_page: result.length,
        prev_page_url: null,
        to: result.length,
        total: result.length,
      }
    }

    // If result.slots is an array (old format)
    if (Array.isArray(result?.slots)) {
      return {
        current_page: 1,
        data: result.slots as LiveSessionSlot[],
        first_page_url: '',
        from: 1,
        last_page: 1,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        per_page: result.slots.length,
        prev_page_url: null,
        to: result.slots.length,
        total: result.slots.length,
      }
    }

    return {
      current_page: 1,
      data: [],
      first_page_url: '',
      from: null,
      last_page: 1,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      per_page: 10,
      prev_page_url: null,
      to: null,
      total: 0,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch live sessions')
  }
}

export const useLiveSessions = (page: number = 1) => {
  return useQuery({
    queryKey: ['live-sessions', page],
    queryFn: () => fetchLiveSessions(page),
    staleTime: 60 * 1000,
  })
}
