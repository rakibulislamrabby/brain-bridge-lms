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

export interface BookedSlotCourse {
  id: number
  teacher_id: number
  subject_id: number
  title: string
  description: string
  thumbnail_url: string
  old_price: string
  price: string
  is_published: number
  enrollment_count: number
  processing_status: string
  created_at: string
  updated_at: string
  subject: BookedSlotSubject
}

export interface TeacherBookedSlot {
  id: number
  course_id: number
  student_id: number
  teacher_id: number
  enrolled_at: string
  amount_paid: string
  currency: string
  payment_status: string
  payment_intent_id: string | null
  payment_method: string | null
  paid_at: string | null
  status: string
  progress_percentage: string
  completed_at: string | null
  created_at: string
  updated_at: string
  course: BookedSlotCourse
  student: BookedSlotStudent
}

export interface TeacherBookedSlotsResponse {
  success?: boolean
  data?: TeacherBookedSlot[]
  message?: string
  [key: string]: unknown
}

const normalizeTeacherBookedSlotsArray = (response: unknown): TeacherBookedSlot[] => {
  // Handle various response structures
  if (Array.isArray(response)) {
    return response
  }
  
  if (typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>
    
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

const fetchTeacherBookedSlots = async (): Promise<TeacherBookedSlot[]> => {
  const url = joinUrl('teacher/slots/booked')
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

    const slots = normalizeTeacherBookedSlotsArray(result)

    if (!Array.isArray(slots)) {
      console.error('🔴 Teacher booked slots is not an array:', slots)
      throw new Error('Invalid data format received from server')
    }

    console.log('✅ Successfully fetched teacher booked slots:', slots.length)
    return slots
  } catch (error) {
    console.error('🔴 Error fetching teacher booked slots:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch booked slots')
  }
}

export const useTeacherBookedSlots = () => {
  return useQuery({
    queryKey: ['teacher-booked-slots'],
    queryFn: fetchTeacherBookedSlots,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

