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

export interface ConfirmPurchaseRequest {
  course_id: number
  payment_intent_id: string
  points_to_use?: number
  new_payment_amount?: number
}

export interface ConfirmPurchaseResponse {
  success?: boolean
  message?: string
  [key: string]: unknown
}

const confirmPurchase = async (payload: ConfirmPurchaseRequest): Promise<ConfirmPurchaseResponse> => {
  const url = joinUrl('courses/confirm-purchase')
  const headers = getAuthHeaders()

  console.log('🔵 Confirm Purchase Request:', { url, payload })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    console.log('🔵 Confirm Purchase Response Status:', response.status)
    console.log('🔵 Confirm Purchase Response Text:', text)

    let result: ConfirmPurchaseResponse = {}
    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('🔴 JSON Parse Error:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('🔵 Confirm Purchase Response Data:', result)

    if (!response.ok) {
      const errorMessage = result?.message || (result as any)?.error || (result as any)?.data?.message || `Failed to confirm purchase (${response.status})`
      console.error('🔴 Confirm Purchase Error:', errorMessage)
      throw new Error(errorMessage)
    }

    // Check if result indicates success
    if (result.success === false) {
      const errorMessage = result?.message || (result as any)?.error || 'Purchase confirmation failed'
      console.error('🔴 Confirm Purchase Failed:', errorMessage)
      throw new Error(errorMessage)
    }

    return result
  } catch (error) {
    console.error('🔴 Confirm purchase error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to confirm purchase')
  }
}

export const useConfirmPurchase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmPurchase,
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['public-courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}


