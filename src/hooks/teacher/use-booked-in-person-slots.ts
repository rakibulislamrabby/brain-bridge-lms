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

export interface InPersonBookedSlotStudent {
  id: number
  name: string
  email: string
}

export interface InPersonBookedSlotSubject {
  id: number
  name: string
}

export interface InPersonBookedSlotDetail {
  id: number
  title: string
  type: string
  price: number | string
  subject: InPersonBookedSlotSubject
}

export interface TeacherBookedInPersonSlot {
  id: number
  slot_id: number
  student_id: number
  scheduled_date: string
  status: string
  slot: InPersonBookedSlotDetail
  student: InPersonBookedSlotStudent
}

export interface PaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface PaginatedTeacherBookedInPersonSlots {
  current_page: number
  data: TeacherBookedInPersonSlot[]
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

export interface TeacherBookedInPersonSlotsResponse {
  slots?: PaginatedTeacherBookedInPersonSlots
  success?: boolean
  data?: PaginatedTeacherBookedInPersonSlots
  [key: string]: unknown
}

const fetchTeacherBookedInPersonSlots = async (page: number = 1): Promise<PaginatedTeacherBookedInPersonSlots> => {
  const url = joinUrl(`teacher/in-person-slots/booked?page=${page}`)
  const headers = getAuthHeaders()

  console.log('🔵 Fetching Teacher Booked In-Person Slots from:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    console.log('🔵 Teacher Booked In-Person Slots Response Status:', response.status)
    console.log('🔵 Teacher Booked In-Person Slots Response Text:', text.substring(0, 500))

    let result: unknown = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🔵 Teacher Booked In-Person Slots Parsed Data:', result)

    if (!response.ok) {
      const errorObj = result as Record<string, unknown>
      const errorMessage = 
        errorObj?.message || 
        errorObj?.error || 
        (typeof errorObj?.data === 'string' ? errorObj.data : null) ||
        `Failed to fetch booked in-person slots (${response.status})`
      console.error('🔴 Teacher Booked In-Person Slots Error:', errorMessage)
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch booked in-person slots')
    }

    const responseObj = result as Record<string, unknown>

    // Handle { slots: { ... } }
    if (responseObj.slots && typeof responseObj.slots === 'object') {
      return responseObj.slots as PaginatedTeacherBookedInPersonSlots
    }

    // Handle { success: true, data: { ... } }
    if (responseObj.success === true && responseObj.data && typeof responseObj.data === 'object') {
      return responseObj.data as PaginatedTeacherBookedInPersonSlots
    }

    // Handle direct pagination object
    if (responseObj.current_page !== undefined) {
      return result as PaginatedTeacherBookedInPersonSlots
    }

    console.error('🔴 Unexpected teacher booked in-person slots response structure:', result)
    throw new Error('Invalid data format received from server')
  } catch (error) {
    console.error('🔴 Error fetching teacher booked in-person slots:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch booked in-person slots')
  }
}

export const useTeacherBookedInPersonSlots = (page: number = 1) => {
  return useQuery({
    queryKey: ['teacher-booked-in-person-slots', page],
    queryFn: () => fetchTeacherBookedInPersonSlots(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

