import { useMutation } from '@tanstack/react-query'

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
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export interface CourseRequestData {
  course_name: string
  course_description: string
  subject: string
  additional_note: string
}

interface CourseRequestResponse {
  success?: boolean
  message?: string
  data?: unknown
  [key: string]: unknown
}

const createCourseRequest = async (data: CourseRequestData): Promise<CourseRequestResponse> => {
  const url = joinUrl('course-requests')
  const headers = getAuthHeaders()

  console.log('🔵 Creating course request:', { url, data })

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  const text = await response.text()
  console.log('🔵 Course Request Response Status:', response.status)
  console.log('🔵 Course Request Response Text:', text.substring(0, 500))

  let result: unknown = {}
  try {
    result = text ? JSON.parse(text) : {}
  } catch (parseError) {
    console.error('🔴 JSON Parse Error:', parseError)
    throw new Error('Invalid response from server')
  }

  if (!response.ok) {
    const errorObj = result as Record<string, unknown>
    const errorMessage =
      errorObj?.message ||
      errorObj?.error ||
      (typeof errorObj?.data === 'string' ? errorObj.data : null) ||
      `Failed to create course request (${response.status})`
    console.error('🔴 Course Request Error:', errorMessage)
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to create course request')
  }

  return result as CourseRequestResponse
}

export const useCourseRequest = () => {
  return useMutation({
    mutationFn: createCourseRequest,
    onError: (error) => {
      console.error('🔴 Course request mutation error:', error)
    },
  })
}

