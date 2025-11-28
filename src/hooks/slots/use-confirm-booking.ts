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

export interface ConfirmBookingRequest {
  slot_id: number
  scheduled_date: string // YYYY-MM-DD format
  payment_intent_id: string
  points_to_use?: number
  new_payment_amount?: number
}

export interface ConfirmBookingResponse {
  success?: boolean
  message?: string
  [key: string]: unknown
}

const confirmBooking = async (payload: ConfirmBookingRequest): Promise<ConfirmBookingResponse> => {
  const url = joinUrl('slot/bookings/confirm')
  const headers = getAuthHeaders()

  console.log('🔵 Confirm Booking Request:', { url, payload })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    console.log('🔵 Confirm Booking Response Status:', response.status)
    console.log('🔵 Confirm Booking Response Text:', text)

    let result: ConfirmBookingResponse = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🔵 Confirm Booking Response Data:', result)

    if (!response.ok) {
      const errorMessage = result?.message || (result as any)?.error || (result as any)?.data?.message || `Failed to confirm booking (${response.status})`
      console.error('🔴 Confirm Booking Error:', errorMessage)
      throw new Error(errorMessage)
    }

    // Check if result indicates success
    if (result.success === false) {
      const errorMessage = result?.message || (result as any)?.error || 'Booking confirmation failed'
      console.error('🔴 Confirm Booking Failed:', errorMessage)
      throw new Error(errorMessage)
    }

    return result
  } catch (error) {
    console.error('🔴 Confirm booking error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to confirm booking')
  }
}

export const useConfirmBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmBooking,
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['live-session'] })
      queryClient.invalidateQueries({ queryKey: ['live-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-slots'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-booked-slots'] })
      queryClient.invalidateQueries({ queryKey: ['student-booked-slots'] })
    },
  })
}

