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

export interface BookedSlotStudent {
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
  meeting_link?: string | null
  is_booked: boolean
  max_students: number
  booked_count: number
  created_at: string
  updated_at: string
  subject: BookedSlotSubject
  session?: TeacherBookedSession | null
}

export interface TeacherBookedSession {
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
  payment_intent_id: string | null
  payment_method: string | null
  amount_paid: string
  currency: string
  paid_at: string | null
  created_at: string
  updated_at: string
  student: BookedSlotStudent
}

export interface TeacherBookedSlot {
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
  meeting_link?: string | null
  is_booked: boolean
  max_students: number
  booked_count: number
  created_at: string
  updated_at: string
  subject: BookedSlotSubject
  session: TeacherBookedSession | null
}

export interface TeacherBookedSlotsResponse {
  success?: boolean
  data?: TeacherBookedSlot[]
  message?: string
  [key: string]: unknown
}

export interface PaginatedTeacherBookedSlots {
  current_page: number
  data: TeacherBookedSlot[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: Array<{ url: string | null; label: string; active: boolean }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

const normalizeTeacherBookedSlotsArray = (response: unknown): TeacherBookedSlot[] => {
  // Handle various response structures
  if (Array.isArray(response)) {
    return response
  }
  
  if (typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>
    
    // Handle { success: true, slots: { data: [...] } }
    if (obj.success === true && obj.slots && typeof obj.slots === 'object') {
      const slotsObj = obj.slots as Record<string, unknown>
      if (Array.isArray(slotsObj.data)) {
        return slotsObj.data as TeacherBookedSlot[]
      }
    }
    
    // Handle { data: [...] }
    if (Array.isArray(obj.data)) {
      return obj.data
    }
    
    // Handle { success: true, data: [...] }
    if (obj.success === true && Array.isArray(obj.data)) {
      return obj.data
    }
    
    // Handle { data: { data: [...] } }
    if (obj.data && typeof obj.data === 'object' && 'data' in obj.data && Array.isArray((obj.data as Record<string, unknown>).data)) {
      return (obj.data as Record<string, unknown>).data as TeacherBookedSlot[]
    }
  }
  
  console.warn('⚠️ Unexpected teacher booked slots response structure:', response)
  return []
}

const fetchTeacherBookedSlots = async (page: number = 1): Promise<PaginatedTeacherBookedSlots> => {
  const url = joinUrl(`teacher/slots/booked?page=${page}`)
  const headers = getAuthHeaders()

  console.log('🔵 Fetching Teacher Booked Slots from:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    console.log('🔵 Teacher Booked Slots Response Status:', response.status)
    console.log('🔵 Teacher Booked Slots Response Text:', text.substring(0, 500))

    let result: unknown = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🔵 Teacher Booked Slots Parsed Data:', result)

    if (!response.ok) {
      const errorObj = result as Record<string, unknown>
      const errorMessage = 
        errorObj?.message || 
        errorObj?.error || 
        (typeof errorObj?.data === 'string' ? errorObj.data : null) ||
        `Failed to fetch booked slots (${response.status})`
      console.error('🔴 Teacher Booked Slots Error:', errorMessage)
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch booked slots')
    }

    // Handle { success: true, slots: { ... } }
    if (typeof result === 'object' && result !== null) {
      const obj = result as Record<string, unknown>
      if (obj.success === true && obj.slots && typeof obj.slots === 'object') {
        const slotsObj = obj.slots as PaginatedTeacherBookedSlots
        console.log('✅ Successfully fetched teacher booked slots:', slotsObj.data?.length || 0)
        return slotsObj
      }
    }

    // Fallback: try to extract slots array
    const slots = normalizeTeacherBookedSlotsArray(result)
    if (Array.isArray(slots)) {
      // Create a paginated response from array
      return {
        current_page: 1,
        data: slots,
        first_page_url: '',
        from: 1,
        last_page: 1,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        per_page: slots.length,
        prev_page_url: null,
        to: slots.length,
        total: slots.length,
      }
    }

    console.error('🔴 Teacher booked slots is not in expected format:', result)
    throw new Error('Invalid data format received from server')
  } catch (error) {
    console.error('🔴 Error fetching teacher booked slots:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch booked slots')
  }
}

export const useTeacherBookedSlots = (page: number = 1) => {
  return useQuery({
    queryKey: ['teacher-booked-slots', page],
    queryFn: () => fetchTeacherBookedSlots(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

