import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getStoredUser } from '../useAuth'

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || ''

const joinUrl = (path: string) => {
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path
  if (!API_BASE_URL) {
    return `/${trimmedPath}`
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  return `${base}/${trimmedPath}`
}

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

export interface ChatMessage {
  id: number
  sender_id: number
  receiver_id: number
  body: string
  read_at: string | null
  created_at: string
  updated_at: string
  sender?: {
    id: number
    name: string
    email: string
    profile_picture?: string
  }
}

export interface SendMessageRequest {
  receiver_id: number
  body: string
}

export interface SendMessageResponse {
  data: ChatMessage
}

export interface GetChatMessagesResponse {
  data: ChatMessage[]
}

// Send message
const sendMessage = async (payload: SendMessageRequest): Promise<SendMessageResponse> => {
  const url = joinUrl('chats/send')
  const headers = getAuthHeaders()

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const text = await response.text()
  let result: any = {}
  
  try {
    result = text ? JSON.parse(text) : {}
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError)
    throw new Error('Invalid response from server')
  }

  if (!response.ok) {
    const errorMessage = result?.message || result?.error || `Failed to send message (${response.status})`
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to send message')
  }

  return result as SendMessageResponse
}

// Get chat messages
const getChatMessages = async (chatId: number): Promise<GetChatMessagesResponse> => {
  const url = joinUrl(`chats/${chatId}`)
  const headers = getAuthHeaders()

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  const text = await response.text()
  let result: any = {}
  
  try {
    result = text ? JSON.parse(text) : {}
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError)
    throw new Error('Invalid response from server')
  }

  if (!response.ok) {
    const errorMessage = result?.message || result?.error || `Failed to fetch messages (${response.status})`
    throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch messages')
  }

  return result as GetChatMessagesResponse
}

// Hook to send a message
export const useSendMessage = (chatId?: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data, variables) => {
      // Invalidate the specific chat query to refetch immediately
      if (chatId) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
      } else {
        // Fallback: invalidate all chat queries
        queryClient.invalidateQueries({ queryKey: ['chat-messages'] })
      }
    },
  })
}

// Hook to get chat messages
export const useChatMessages = (chatId: number, enabled: boolean = true) => {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: () => getChatMessages(chatId),
    enabled: enabled && !!chatId,
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
    // Refetch on window focus for better real-time experience
    refetchOnWindowFocus: true,
  })
}


