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

export interface TeacherSlotSubject {
  id: number
  name: string
  parent_id?: number | null
  created_at?: string
  updated_at?: string
}

export interface SlotTimeRange {
  start_time: string
  end_time: string
  meeting_link?: string
}

export interface DaySlot {
  slot_day: string
  times: SlotTimeRange[]
}

export interface TeacherSlot {
  id: number
  teacher_id: number
  subject_id: number
  title: string
  type: string
  price: string
  description: string
  video?: string | null
  from_date: string
  to_date: string
  slots: DaySlot[]
  is_booked: boolean
  max_students: number
  booked_count: number
  created_at?: string
  updated_at?: string
  subject?: TeacherSlotSubject
}

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface PaginatedTeacherSlotsResponse {
  current_page: number
  data: TeacherSlot[]
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

export interface TeacherSlotsResponse {
  success: boolean
  slots: PaginatedTeacherSlotsResponse
}

const fetchTeacherSlots = async (page: number = 1): Promise<PaginatedTeacherSlotsResponse> => {
  const url = joinUrl(`teacher/slots?page=${page}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result: TeacherSlotsResponse | any = text ? JSON.parse(text) : {}

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch teacher slots (${response.status})`
      throw new Error(errorMessage)
    }

    // Handle paginated response with success wrapper
    if (result?.success && result?.slots) {
      return result.slots as PaginatedTeacherSlotsResponse
    }

    // Fallback for non-paginated response
    if (Array.isArray(result)) {
      return {
        current_page: 1,
        data: result as TeacherSlot[],
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
        data: result.slots as TeacherSlot[],
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
    console.error('Fetch teacher slots error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch teacher slots')
  }
}

export const useTeacherSlots = (page: number = 1) => {
  return useQuery({
    queryKey: ['teacher-slots', page],
    queryFn: () => fetchTeacherSlots(page),
    staleTime: 60 * 1000,
  })
}

