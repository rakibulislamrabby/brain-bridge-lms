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

export interface EnrolledCourse {
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
  course: {
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
    subject: {
      id: number
      name: string
      parent_id: number | null
      created_at: string
      updated_at: string
    }
    teacher: {
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
  }
}

export interface EnrolledCoursesResponse {
  success?: boolean
  data?: EnrolledCourse[]
  message?: string
  [key: string]: unknown
}

const normalizeEnrolledCoursesArray = (response: unknown): EnrolledCourse[] => {
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
      return (obj.data as Record<string, unknown>).data as EnrolledCourse[]
    }
  }
  
  console.warn('⚠️ Unexpected enrolled courses response structure:', response)
  return []
}

const fetchEnrolledCourses = async (): Promise<EnrolledCourse[]> => {
  const url = joinUrl('student/enrolled-courses')
  const token = getAuthToken()
  
  // If no auth token, return empty array (user is not authenticated)
  if (!token) {
    return []
  }

  const headers = getAuthHeaders()

  console.log('🔵 Fetching Enrolled Courses from:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    console.log('🔵 Enrolled Courses Response Status:', response.status)
    console.log('🔵 Enrolled Courses Response Text:', text.substring(0, 500))

    let result: unknown = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🔵 Enrolled Courses Parsed Data:', result)

    if (!response.ok) {
      const errorObj = result as Record<string, unknown>
      const errorMessage = 
        errorObj?.message || 
        errorObj?.error || 
        (typeof errorObj?.data === 'string' ? errorObj.data : null) ||
        `Failed to fetch enrolled courses (${response.status})`
      
      // If unauthenticated, return empty array instead of throwing error
      if (response.status === 401 || errorMessage === 'Unauthenticated.' || String(errorMessage).includes('Unauthenticated')) {
        console.log('ℹ️ User is not authenticated, returning empty enrolled courses')
        return []
      }
      
      console.error('🔴 Enrolled Courses Error:', errorMessage)
      throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch enrolled courses')
    }

    const courses = normalizeEnrolledCoursesArray(result)

    if (!Array.isArray(courses)) {
      console.error('🔴 Enrolled courses is not an array:', courses)
      throw new Error('Invalid data format received from server')
    }

    console.log('✅ Successfully fetched enrolled courses:', courses.length)
    return courses
  } catch (error) {
    console.error('🔴 Error fetching enrolled courses:', error)
    if (error instanceof Error) {
      // If it's an unauthenticated error, return empty array
      if (error.message.includes('Unauthenticated') || error.message.includes('401')) {
        return []
      }
      throw error
    }
    throw new Error('Network error: Failed to fetch enrolled courses')
  }
}

export const useEnrolledCourses = () => {
  const token = getAuthToken()
  
  return useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: fetchEnrolledCourses,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: !!token, // Only fetch if user is authenticated
  })
}

