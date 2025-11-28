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
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export interface NotificationData {
  message: string
  level?: string
  new_base_pay?: number
  [key: string]: any
}

export interface Notification {
  id: string
  type: string
  notifiable_type: string
  notifiable_id: number
  data: NotificationData
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface LatestNotificationResponse {
  status: string
  notification: Notification | null
}

const fetchLatestNotification = async (): Promise<LatestNotificationResponse> => {
  const url = joinUrl('notifications/latest')
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch latest notification (${response.status})`
      throw new Error(errorMessage)
    }

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format')
    }

    return result as LatestNotificationResponse
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch latest notification')
  }
}

export const useLatestNotification = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['notifications', 'latest'],
    queryFn: fetchLatestNotification,
    enabled,
    staleTime: 10 * 1000, // 10 seconds
    retry: 1,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  })
}


