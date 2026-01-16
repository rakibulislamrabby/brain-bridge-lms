'use client'

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
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export interface InPersonSlotSubject {
  id: number
  name: string
  icon?: string | null
  parent_id?: number | null
  created_at?: string
  updated_at?: string
}

export interface InPersonSlotTime {
  id: number
  in_person_slot_day_id: number
  start_time: string
  end_time: string
  is_booked: number
  created_at: string
  updated_at: string
}

export interface InPersonSlotDay {
  id: number
  in_person_slot_id: number
  day: string
  created_at: string
  updated_at: string
  times: InPersonSlotTime[]
}

export interface InPersonSlot {
  id: number
  teacher_id: number
  subject_id: number
  title: string
  price: string
  description: string
  from_date: string
  to_date: string
  is_booked: boolean
  country?: string
  state?: string
  city?: string
  area?: string
  video?: string | null
  created_at?: string
  updated_at?: string
  subject?: InPersonSlotSubject
  days?: InPersonSlotDay[]
}

export interface PaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface PaginatedInPersonSlotsResponse {
  current_page: number
  data: InPersonSlot[]
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

export interface InPersonSlotsResponse {
  success: boolean
  slots: PaginatedInPersonSlotsResponse
}

const fetchInPersonSlots = async (page: number = 1): Promise<PaginatedInPersonSlotsResponse> => {
  const url = joinUrl(`teacher/in-person-slots?page=${page}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result: InPersonSlotsResponse | any = text ? JSON.parse(text) : {}

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch in-person slots (${response.status})`
      throw new Error(errorMessage)
    }

    // Handle paginated response with success wrapper
    if (result?.success && result?.slots) {
      return result.slots as PaginatedInPersonSlotsResponse
    }

    // Fallback for non-paginated response
    if (Array.isArray(result)) {
      return {
        current_page: 1,
        data: result as InPersonSlot[],
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
        data: result.slots as InPersonSlot[],
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
    console.error('Fetch in-person slots error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch in-person slots')
  }
}

export const useInPersonSlots = (page: number = 1) => {
  return useQuery({
    queryKey: ['in-person-slots', page],
    queryFn: () => fetchInPersonSlots(page),
    staleTime: 60 * 1000,
  })
}

