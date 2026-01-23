'use client'

import { useQuery } from '@tanstack/react-query'
import type { InPersonSlot } from './use-in-person-slots'

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

export interface TeacherInPersonSlotDetailResponse {
  success: boolean
  data: InPersonSlot
}

const fetchTeacherInPersonSlotDetail = async (id: number): Promise<InPersonSlot> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid in-person slot id provided')
  }

  // Use edit-specific endpoint: teacher/in-person-slots/edit/{id}
  const url = joinUrl(`teacher/in-person-slots/edit/${id}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    let result: TeacherInPersonSlotDetailResponse | any = {}

    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('Failed to parse response:', parseError)
      throw new Error('Invalid response format from server')
    }

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch in-person slot (${response.status})`
      throw new Error(errorMessage)
    }

    // Handle response structure: { success: true, data: {...} }
    if (result?.success && result?.data) {
      return result.data as InPersonSlot
    }

    // Fallback: if result is the slot object directly (for backward compatibility)
    if (result?.id) {
      return result as InPersonSlot
    }

    throw new Error('In-person slot not found')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch in-person slot')
  }
}

export const useTeacherInPersonSlotDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['teacher-in-person-slot', id],
    queryFn: () => fetchTeacherInPersonSlotDetail(id!),
    enabled: Number.isFinite(id) && id !== null && id > 0,
    staleTime: 60 * 1000,
  })
}
