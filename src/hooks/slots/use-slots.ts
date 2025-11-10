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

export interface SlotSubject {
  id: number
  name: string
  parent_id: number | null
  created_at?: string
  updated_at?: string
}

export interface Slot {
  id: number
  teacher_id: number
  subject_id: number
  type: string
  price: string
  description: string
  available_date: string
  start_time: string
  end_time: string
  is_booked: boolean
  max_students: number
  booked_count: number
  created_at?: string
  updated_at?: string
  subject?: SlotSubject
}

interface SlotsResponse {
  slots: Slot[]
}

const normalizeSlots = (result: any): Slot[] => {
  if (!result) {
    return []
  }

  if (Array.isArray(result)) {
    return result as Slot[]
  }

  if (Array.isArray(result?.slots)) {
    return result.slots as Slot[]
  }

  if (Array.isArray(result?.data)) {
    return result.data as Slot[]
  }

  return []
}

const fetchSlots = async (): Promise<Slot[]> => {
  const url = joinUrl('teacher/slots')
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result: SlotsResponse | any = text ? JSON.parse(text) : {}

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch slots (${response.status})`
      throw new Error(errorMessage)
    }

    return normalizeSlots(result)
  } catch (error) {
    console.error('Fetch slots error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch slots')
  }
}

export const useSlots = () => {
  return useQuery({
    queryKey: ['slots'],
    queryFn: fetchSlots,
    staleTime: 60 * 1000,
  })
}

