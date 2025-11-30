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
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export interface InPersonBookingIntentRequest {
  slot_id: number
  scheduled_date: Date
}

export interface SlotInfo {
  id: number
  subject: string
  teacher: string
  title: string
  price: string
}

export interface InPersonBookingIntentResponse {
  success?: boolean
  requires_payment?: boolean
  client_secret?: string
  payment_intent_id?: string
  amount?: string
  slot?: SlotInfo
  message?: string
  [key: string]: unknown
}

const formatDateToString = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createInPersonBookingIntent = async (payload: InPersonBookingIntentRequest): Promise<InPersonBookingIntentResponse> => {
  const url = joinUrl('in-person-slot/bookings/intent')
  const headers = getAuthHeaders()

  // Convert Date to YYYY-MM-DD string format
  const requestBody = {
    slot_id: payload.slot_id,
    scheduled_date: formatDateToString(payload.scheduled_date),
  }

  console.log('🟢 In-Person Booking Intent Request:', { url, requestBody })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    const text = await response.text()
    console.log('🟢 In-Person Booking Intent Response Status:', response.status)
    console.log('🟢 In-Person Booking Intent Response Text:', text)

    let result: InPersonBookingIntentResponse = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🟢 In-Person Booking Intent Response Data:', result)

    if (!response.ok) {
      const errorMessage = result?.message || (result as any)?.error || `Failed to create booking intent (${response.status})`
      console.error('🔴 In-Person Booking Intent Error:', errorMessage)
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
    console.error('🔴 Create in-person booking intent error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to create booking intent')
  }
}

export const useInPersonBookingIntent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInPersonBookingIntent,
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['in-person-slot'] })
      queryClient.invalidateQueries({ queryKey: ['public-in-person-slots'] })
    },
  })
}

