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
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export interface InPersonSlotTimeRange {
  start_time: string
  end_time: string
}

export interface CreateInPersonSlotRequest {
  title: string
  subject_id: number
  from_date: string
  to_date: string
  slots: InPersonSlotTimeRange[]
  price: number
  description: string
}

export interface CreateInPersonSlotResponse {
  message?: string
  [key: string]: unknown
}

const createInPersonSlot = async (payload: CreateInPersonSlotRequest): Promise<CreateInPersonSlotResponse> => {
  const url = joinUrl('teacher/in-person-slots')
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : {}

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to create in-person slot (${response.status})`
      throw new Error(errorMessage)
    }

    return result
  } catch (error) {
    console.error('Create in-person slot error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to create in-person slot')
  }
}

export const useCreateInPersonSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInPersonSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-slots'] })
      queryClient.invalidateQueries({ queryKey: ['in-person-slots'] })
    },
  })
}

