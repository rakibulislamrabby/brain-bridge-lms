import { useMutation, useQueryClient } from '@tanstack/react-query'

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

export interface CourseRequestActionData {
  admin_note?: string
}

interface CourseRequestActionResponse {
  success?: boolean
  message?: string
  data?: unknown
  [key: string]: unknown
}

const approveCourseRequest = async (
  requestId: number,
  data?: CourseRequestActionData
): Promise<CourseRequestActionResponse> => {
  const url = joinUrl(`course-requests/${requestId}/approve`)
  const headers = getAuthHeaders()

  console.log('🔵 Approving course request:', { url, requestId, data })

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data || {}),
  })

  const text = await response.text()
  console.log('🔵 Approve Course Request Response Status:', response.status)

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
      `Failed to approve course request (${response.status})`
    console.error('🔴 Approve Course Request Error:', errorMessage)
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to approve course request')
  }

  return result as CourseRequestActionResponse
}

const rejectCourseRequest = async (
  requestId: number,
  data?: CourseRequestActionData
): Promise<CourseRequestActionResponse> => {
  const url = joinUrl(`course-requests/${requestId}/reject`)
  const headers = getAuthHeaders()

  console.log('🔵 Rejecting course request:', { url, requestId, data })

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data || {}),
  })

  const text = await response.text()
  console.log('🔵 Reject Course Request Response Status:', response.status)

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
      `Failed to reject course request (${response.status})`
    console.error('🔴 Reject Course Request Error:', errorMessage)
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to reject course request')
  }

  return result as CourseRequestActionResponse
}

export const useApproveCourseRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: number; data?: CourseRequestActionData }) =>
      approveCourseRequest(requestId, data),
    onSuccess: () => {
      // Invalidate course requests queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['course-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-course-requests'] })
    },
  })
}

export const useRejectCourseRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: number; data?: CourseRequestActionData }) =>
      rejectCourseRequest(requestId, data),
    onSuccess: () => {
      // Invalidate course requests queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['course-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-course-requests'] })
    },
  })
}

