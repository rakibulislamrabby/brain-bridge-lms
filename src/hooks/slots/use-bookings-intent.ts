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

export interface BookingIntentRequest {
  slot_id: number
  scheduled_date: Date
}

export interface BookingIntentResponse {
  message?: string
  [key: string]: unknown
}

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createBookingIntent = async (payload: BookingIntentRequest): Promise<BookingIntentResponse> => {
  const url = joinUrl('slot/bookings/intent')
  const headers = getAuthHeaders()

  // Convert Date to YYYY-MM-DD string format
  const requestBody = {
    slot_id: payload.slot_id,
    scheduled_date: formatDateToString(payload.scheduled_date),
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : {}

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to create booking intent (${response.status})`
      throw new Error(errorMessage)
    }

    return result
  } catch (error) {
    console.error('Create booking intent error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to create booking intent')
  }
}

export const useBookingIntent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBookingIntent,
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['live-session'] })
      queryClient.invalidateQueries({ queryKey: ['live-sessions'] })
    },
  })
}

