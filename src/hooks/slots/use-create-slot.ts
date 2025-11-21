'use client'

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

export interface SlotTimeRange {
  start_time: string
  end_time: string
  meeting_link: string
}

export interface CreateSlotRequest {
  subject_id: number
  title: string
  from_date: string
  to_date: string
  slots: SlotTimeRange[]
  type: string
  price: number
  max_students: number
  description: string
}

export interface CreateSlotResponse {
  message?: string
  [key: string]: unknown
}

const createSlot = async (payload: CreateSlotRequest): Promise<CreateSlotResponse> => {
  const url = joinUrl('teacher/slots')
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
      const errorMessage = result?.message || result?.error || `Failed to create slot (${response.status})`
      throw new Error(errorMessage)
    }

    return result
  } catch (error) {
    console.error('Create slot error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to create slot')
  }
}

const updateSlot = async (id: number, payload: CreateSlotRequest): Promise<CreateSlotResponse> => {
  const url = joinUrl(`teacher/slots/${id}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : {}

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to update slot (${response.status})`
      throw new Error(errorMessage)
    }

    return result
  } catch (error) {
    console.error('Update slot error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to update slot')
  }
}

export const useCreateSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-slots'] })
    },
  })
}

export const useUpdateSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateSlotRequest }) => updateSlot(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-slots'] })
    },
  })
}

