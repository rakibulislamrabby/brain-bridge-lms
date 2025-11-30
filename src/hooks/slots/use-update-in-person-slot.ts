import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateInPersonSlotRequest, CreateInPersonSlotResponse } from './use-create-in-person-slot'

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

const updateInPersonSlot = async (id: number, payload: CreateInPersonSlotRequest): Promise<CreateInPersonSlotResponse> => {
  const url = joinUrl(`teacher/in-person-slots/${id}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'PUT',
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
      
      const errorMessage = result?.message || result?.error || `Failed to update in-person slot (${response.status})`
      throw new Error(errorMessage)
    }

    // Validate response structure
    if (!result.success) {
      throw new Error(result?.message || 'Slot update failed')
    }

    // Handle both array and single object responses
    // PUT might return a single slot object, while POST returns an array
    if (!result.data) {
      throw new Error('Invalid response: missing data field')
    }

    // If data is not an array, wrap it in an array to match the response type
    if (!Array.isArray(result.data)) {
      result.data = [result.data]
    }

    return result as CreateInPersonSlotResponse
  } catch (error) {
    console.error('Update in-person slot error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to update in-person slot')
  }
}

export const useUpdateInPersonSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateInPersonSlotRequest }) => updateInPersonSlot(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-slots'] })
      queryClient.invalidateQueries({ queryKey: ['in-person-slots'] })
    },
  })
}

