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

export interface CoursePaymentIntentRequest {
  course_id: number
  points_to_use?: number
  new_payment_amount?: number
}

export interface CourseInfo {
  id: number
  title: string
  subject: string
  teacher: string
  price: number
  old_price?: number
}

export interface CoursePaymentIntentResponse {
  success?: boolean
  requires_payment?: boolean
  client_secret?: string
  payment_intent_id?: string
  amount?: number | string
  new_payment_amount?: number | string
  course?: CourseInfo
  message?: string
  [key: string]: unknown
}

const createCoursePaymentIntent = async (
  payload: CoursePaymentIntentRequest
): Promise<CoursePaymentIntentResponse> => {
  const url = joinUrl('courses/payment-intent')
  const headers = getAuthHeaders()

  const requestBody: any = {
    course_id: payload.course_id,
  }

  if (payload.points_to_use !== undefined && payload.points_to_use > 0) {
    requestBody.points_to_use = payload.points_to_use
  }

  if (payload.new_payment_amount !== undefined) {
    requestBody.new_payment_amount = payload.new_payment_amount
  }

  console.log('🟢 Course Payment Intent Request:', { url, requestBody })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    const text = await response.text()
    console.log('🟢 Course Payment Intent Response Status:', response.status)
    console.log('🟢 Course Payment Intent Response Text:', text)

    let result: CoursePaymentIntentResponse = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🟢 Course Payment Intent Response Data:', result)

    if (!response.ok) {
      const errorMessage =
        result?.message || (result as any)?.error || `Failed to create payment intent (${response.status})`
      console.error('🔴 Course Payment Intent Error:', errorMessage)
      throw new Error(errorMessage)
    }

    // Log success details
    if (result.requires_payment) {
      console.log('✅ Payment required:', {
        client_secret: result.client_secret ? 'Present' : 'Missing',
        payment_intent_id: result.payment_intent_id,
        amount: result.amount,
        course: result.course,
      })
    } else {
      console.log('✅ No payment required')
    }

    return result
  } catch (error) {
    console.error('🔴 Create course payment intent error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to create payment intent')
  }
}

export const useCoursePaymentIntent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCoursePaymentIntent,
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['public-courses'] })
      queryClient.invalidateQueries({ queryKey: ['public-courses', 'course'] })
    },
  })
}

