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

interface DeleteCourseRequestResponse {
  id: number
  [key: string]: unknown
}

const deleteCourseRequest = async (requestId: number): Promise<DeleteCourseRequestResponse> => {
  const url = joinUrl(`my-course-requests-delete/${requestId}`)
  const headers = getAuthHeaders()

  console.log('🔵 Deleting course request:', { url, requestId })

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  })

  const text = await response.text()
  console.log('🔵 Delete Course Request Response Status:', response.status)
  console.log('🔵 Delete Course Request Response Text:', text)

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
      `Failed to delete course request (${response.status})`
    console.error('🔴 Delete Course Request Error:', errorMessage)
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to delete course request')
  }

  console.log('✅ Successfully deleted course request')
  return result as DeleteCourseRequestResponse
}

export const useDeleteCourseRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number) => deleteCourseRequest(requestId),
    onSuccess: () => {
      // Invalidate course requests queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['my-course-requests'] })
    },
  })
}

