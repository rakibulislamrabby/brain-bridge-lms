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

export interface BookedSlotTeacher {
  id: number
  name: string
  email: string
  phone: string | null
  firebase_uid: string
  email_verified_at: string | null
  bio: string | null
  address: string | null
  profile_picture: string | null
  is_active: number
  google_access_token: string | null
  google_refresh_token: string | null
  google_token_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface BookedSlotSubject {
  id: number
  name: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

export interface BookedSlotDetail {
  id: number
  teacher_id: number
  subject_id: number
  title: string
  type: string
  price: string
  description: string
  from_date: string
  to_date: string
  start_time: string
  end_time: string
  is_booked: boolean
  max_students: number
  booked_count: number
  created_at: string
  updated_at: string
  teacher: BookedSlotTeacher
  subject: BookedSlotSubject
}

export interface StudentBookedSlot {
  id: number
  slot_id: number
  student_id: number
  teacher_id: number
  subject_id: number
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
  session_type: string
  status: string
  price: string
  meeting_platform: string | null
  meeting_link: string | null
  meeting_id: string | null
  description: string | null
  payment_status: string
  payment_intent_id: string
  payment_method: string
  amount_paid: string
  currency: string
  paid_at: string
  created_at: string
  updated_at: string
  slot: BookedSlotDetail
}

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface PaginatedBookedSlots {
  current_page: number
  data: StudentBookedSlot[]
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

export interface StudentBookedSlotsResponse {
  slots: PaginatedBookedSlots
}

const fetchStudentBookedSlots = async (page: number = 1): Promise<PaginatedBookedSlots> => {
  const url = `${joinUrl('student/booked-slots')}?page=${page}`
  const headers = getAuthHeaders()

  console.log('🔵 Fetching Student Booked Slots from:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    console.log('🔵 Student Booked Slots Response Status:', response.status)
    console.log('🔵 Student Booked Slots Response Text:', text.substring(0, 500))

    if (!response.ok) {
      throw new Error(`Failed to fetch booked slots (${response.status})`)
    }

    let result: unknown = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🔵 Student Booked Slots Parsed Data:', result)

    const responseObj = result as Record<string, unknown>

    // Handle { slots: { ... } }
    if (responseObj.slots && typeof responseObj.slots === 'object') {
      return responseObj.slots as PaginatedBookedSlots
    }

    // Handle direct pagination object
    if (responseObj.current_page !== undefined) {
      return result as PaginatedBookedSlots
    }

    console.error('🔴 Unexpected student booked slots response structure:', result)
    throw new Error('Invalid data format received from server')
  } catch (error) {
    console.error('🔴 Error fetching student booked slots:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch booked slots')
  }
}

export const useStudentBookedSlots = (page: number = 1) => {
  return useQuery({
    queryKey: ['student-booked-slots', page],
    queryFn: () => fetchStudentBookedSlots(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

