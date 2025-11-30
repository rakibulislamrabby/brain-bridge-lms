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

export interface ConfirmInPersonBookingRequest {
  slot_id: number
  scheduled_date: string // YYYY-MM-DD format
  payment_intent_id: string
  points_to_use?: number
  new_payment_amount?: number
}

export interface ConfirmInPersonBookingResponse {
  success?: boolean
  message?: string
  [key: string]: unknown
}

const confirmInPersonBooking = async (payload: ConfirmInPersonBookingRequest): Promise<ConfirmInPersonBookingResponse> => {
  const url = joinUrl('in-person-slot/bookings/confirm')
  const headers = getAuthHeaders()

  console.log('🔵 Confirm In-Person Booking Request:', { url, payload })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    console.log('🔵 Confirm In-Person Booking Response Status:', response.status)
    console.log('🔵 Confirm In-Person Booking Response Text:', text)

    let result: ConfirmInPersonBookingResponse = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🔵 Confirm In-Person Booking Response Data:', result)

    if (!response.ok) {
      const errorMessage = result?.message || (result as any)?.error || (result as any)?.data?.message || `Failed to confirm booking (${response.status})`
      console.error('🔴 Confirm In-Person Booking Error:', errorMessage)
      throw new Error(errorMessage)
    }

    // Check if result indicates success
    if (result.success === false) {
      const errorMessage = result?.message || (result as any)?.error || 'Booking confirmation failed'
      console.error('🔴 Confirm In-Person Booking Failed:', errorMessage)
      throw new Error(errorMessage)
    }

    return result
  } catch (error) {
    console.error('🔴 Confirm in-person booking error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to confirm booking')
  }
}

export const useConfirmInPersonBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmInPersonBooking,
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['in-person-slot'] })
      queryClient.invalidateQueries({ queryKey: ['in-person-slots'] })
      queryClient.invalidateQueries({ queryKey: ['public-in-person-slots'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-booked-slots'] })
      queryClient.invalidateQueries({ queryKey: ['student-booked-slots'] })
    },
  })
}

