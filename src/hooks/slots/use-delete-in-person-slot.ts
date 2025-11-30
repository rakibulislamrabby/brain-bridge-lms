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
    Accept: 'application/json',
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

const deleteInPersonSlot = async (id: number): Promise<void> => {
  const url = joinUrl(`teacher/in-person-slots/${id}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      let result: any = null
      try {
        const text = await response.text()
        result = text ? JSON.parse(text) : null
      } catch (parseError) {
        // ignore parse error
      }

      const errorMessage = result?.message || result?.error || `Failed to delete in-person slot (${response.status})`
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error('Delete in-person slot error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to delete in-person slot')
  }
}

export const useDeleteInPersonSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInPersonSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['in-person-slots'] })
      queryClient.invalidateQueries({ queryKey: ['public-in-person-slots'] })
    },
  })
}

