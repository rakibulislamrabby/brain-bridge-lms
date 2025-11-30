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

export interface InPersonBookedSlotTeacher {
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
  teacher: InPersonBookedSlotTeacher
  subject: InPersonBookedSlotSubject
}

export interface StudentBookedInPersonSlot {
  id: number
  slot_id: number
  student_id: number
  scheduled_date: string
  status: string
  slot: InPersonBookedSlotDetail
}

export interface PaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface PaginatedBookedInPersonSlots {
  current_page: number
  data: StudentBookedInPersonSlot[]
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

export interface StudentBookedInPersonSlotsResponse {
  slots: PaginatedBookedInPersonSlots
}

const fetchStudentBookedInPersonSlots = async (page: number = 1): Promise<PaginatedBookedInPersonSlots> => {
  const url = `${joinUrl('student/booked-in-person-slots')}?page=${page}`
  const headers = getAuthHeaders()

  console.log('🔵 Fetching Student Booked In-Person Slots from:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    console.log('🔵 Student Booked In-Person Slots Response Status:', response.status)
    console.log('🔵 Student Booked In-Person Slots Response Text:', text.substring(0, 500))

    if (!response.ok) {
      throw new Error(`Failed to fetch booked in-person slots (${response.status})`)
    }

    let result: unknown = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🔵 Student Booked In-Person Slots Parsed Data:', result)

    const responseObj = result as Record<string, unknown>

    // Handle { slots: { ... } }
    if (responseObj.slots && typeof responseObj.slots === 'object') {
      return responseObj.slots as PaginatedBookedInPersonSlots
    }

    // Handle direct pagination object
    if (responseObj.current_page !== undefined) {
      return result as PaginatedBookedInPersonSlots
    }

    console.error('🔴 Unexpected student booked in-person slots response structure:', result)
    throw new Error('Invalid data format received from server')
  } catch (error) {
    console.error('🔴 Error fetching student booked in-person slots:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch booked in-person slots')
  }
}

export const useStudentBookedInPersonSlots = (page: number = 1) => {
  return useQuery({
    queryKey: ['student-booked-in-person-slots', page],
    queryFn: () => fetchStudentBookedInPersonSlots(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

