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
  day_id?: number
  time_id?: number
  points_to_use?: number
  new_payment_amount?: number
}

export interface SlotInfo {
  id: number
  subject: string
  teacher: string
  scheduled_date: string
  start_time: string
  end_time: string
  price: string
}

export interface BookingIntentResponse {
  success?: boolean
  requires_payment?: boolean
  client_secret?: string
  payment_intent_id?: string
  amount?: string
  new_payment_amount?: number | string
  slot?: SlotInfo
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
  const requestBody: any = {
    slot_id: payload.slot_id,
    scheduled_date: formatDateToString(payload.scheduled_date),
  }

  // Include day_id and time_id if provided (0 is a valid value)
  if (payload.day_id !== undefined && payload.day_id !== null) {
    requestBody.day_id = payload.day_id
  }

  if (payload.time_id !== undefined && payload.time_id !== null) {
    requestBody.time_id = payload.time_id
  }

  if (payload.points_to_use !== undefined && payload.points_to_use > 0) {
    requestBody.points_to_use = payload.points_to_use
  }

  if (payload.new_payment_amount !== undefined) {
    requestBody.new_payment_amount = payload.new_payment_amount
  }

  console.log('🟢 Booking Intent Request:', { url, requestBody })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    const text = await response.text()
    console.log('🟢 Booking Intent Response Status:', response.status)
    console.log('🟢 Booking Intent Response Text:', text)

    let result: BookingIntentResponse = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🟢 Booking Intent Response Data:', result)

    if (!response.ok) {
      const errorMessage = result?.message || (result as any)?.error || `Failed to create booking intent (${response.status})`
      console.error('🔴 Booking Intent Error:', errorMessage)
      throw new Error(errorMessage)
    }

    // Log success details
    if (result.requires_payment) {
      console.log('✅ Payment required:', {
        client_secret: result.client_secret ? 'Present' : 'Missing',
        payment_intent_id: result.payment_intent_id,
        amount: result.amount,
        slot: result.slot,
      })
    } else {
      console.log('✅ No payment required')
    }

    return result
  } catch (error) {
    console.error('🔴 Create booking intent error:', error)
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

