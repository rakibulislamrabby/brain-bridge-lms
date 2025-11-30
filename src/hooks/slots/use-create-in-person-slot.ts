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
  country?: string
  state?: string
  city?: string
  area?: string
}

export interface InPersonSlotData {
  id: number
  country: string
  state: string
  city: string
  area: string
  title: string
  teacher_id: number
  subject_id: number
  from_date: string
  to_date: string
  start_time: string
  end_time: string
  price: number
  description: string
  created_at: string
  updated_at: string
}

export interface CreateInPersonSlotResponse {
  success: boolean
  message: string
  data: InPersonSlotData[]
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
    let result: CreateInPersonSlotResponse | any = {}
    
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('Failed to parse response:', parseError)
      throw new Error('Invalid response format from server')
    }

    if (!response.ok) {
      // Handle validation errors
      if (result?.errors && typeof result.errors === 'object') {
        const errorMessages = Object.entries(result.errors)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages]
            return `${field}: ${msgArray.join(', ')}`
          })
          .join('; ')
        throw new Error(errorMessages || 'Validation failed')
      }
      
      const errorMessage = result?.message || result?.error || `Failed to create in-person slot (${response.status})`
      throw new Error(errorMessage)
    }

    // Validate response structure
    if (!result.success) {
      throw new Error(result?.message || 'Slot creation failed')
    }

    if (!Array.isArray(result.data)) {
      throw new Error('Invalid response: expected array of slots')
    }

    return result as CreateInPersonSlotResponse
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

