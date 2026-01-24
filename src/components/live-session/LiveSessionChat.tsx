'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Send, Loader2, X, MessageSquare, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useChatMessages, useSendMessage, ChatMessage } from '@/hooks/chat/use-chat'
import { subscribeToChat } from '@/lib/pusher'
import { useToast } from '@/components/ui/toast'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_MAIN_STORAGE_URL || process.env.NEXT_PUBLIC_MEDIA_BASE_URL || ''

const resolveAvatarUrl = (path?: string | null): string | null => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return null
  }
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  if (!STORAGE_BASE_URL) {
    return null
  }
  const base = STORAGE_BASE_URL.endsWith('/') ? STORAGE_BASE_URL.slice(0, -1) : STORAGE_BASE_URL
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${cleanedPath}`
}

interface LiveSessionChatProps {
  teacher: {
    id: number
    name: string
    email?: string
  }
  currentUser: {
    id: number
    name: string
  }
  isOpen: boolean
  onClose: () => void
  onUnreadCountChange?: (count: number) => void
}

export default function LiveSessionChat({ teacher, currentUser, isOpen, onClose, onUnreadCountChange }: LiveSessionChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [lastSeenMessageId, setLastSeenMessageId] = useState<number | null>(null)
  
  // Use teacher.id as chatId (receiver_id from student's perspective for API)
  const chatId = teacher.id
  
  // Always fetch messages to track unread count even when chat is closed
  const { data: messagesData, isLoading: isLoadingMessages } = useChatMessages(chatId, true)
  const sendMessageMutation = useSendMessage(chatId)

  // Transform API messages to UI format
  const messages = useMemo(() => {
    if (!messagesData?.data) return []
    return messagesData.data.map((msg: ChatMessage) => ({
      id: msg.id.toString(),
      sender_id: msg.sender_id,
      text: msg.body,
      timestamp: msg.created_at,
      is_me: msg.sender_id === currentUser.id,
      messageId: msg.id,
    }))
  }, [messagesData, currentUser.id])

  // Calculate unread messages from teacher (messages sent by teacher after last seen)
  const unreadCount = useMemo(() => {
    // When chat is open, no unread messages (all are seen)
    if (isOpen) {
      return 0
    }
    
    if (!messagesData?.data || messagesData.data.length === 0) return 0
    
    // Count unread messages from teacher (not from current user)
    const unread = messagesData.data.filter((msg: ChatMessage) => {
      // Only count messages from teacher (not from current user)
      const isFromTeacher = msg.sender_id !== currentUser.id
      // Check if message is after last seen (or if we haven't seen any messages yet)
      const isUnread = !lastSeenMessageId || msg.id > lastSeenMessageId
      return isFromTeacher && isUnread
    }).length
    
    return unread
  }, [messagesData, currentUser.id, isOpen, lastSeenMessageId])

  // Notify parent of unread count changes
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount)
    }
  }, [unreadCount, onUnreadCountChange])

  // Mark all messages as seen when chat opens
  useEffect(() => {
    if (isOpen && messagesData?.data && messagesData.data.length > 0) {
      // Find the latest message ID
      const latestMessage = messagesData.data[messagesData.data.length - 1]
      if (latestMessage.id && latestMessage.id !== lastSeenMessageId) {
        setLastSeenMessageId(latestMessage.id)
      }
    }
  }, [isOpen, messagesData, lastSeenMessageId])

  // Subscribe to Pusher for real-time updates (even when closed to track unread messages)
  useEffect(() => {
    const unsubscribe = subscribeToChat(
      currentUser.id,
      teacher.id,
      (newMessage: ChatMessage) => {
        console.log('New message received via Pusher:', newMessage)
        // Message received via Pusher - invalidate query to refetch immediately
        queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
      },
      (error) => {
        console.error('Pusher subscription error:', error)
      }
    )

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [currentUser.id, teacher.id, chatId, queryClient])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sendMessageMutation.isPending) return

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      await sendMessageMutation.mutateAsync({
        receiver_id: teacher.id,
        body: messageText,
      })
      // Message will appear via Pusher or refetch
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to send message',
        description: error instanceof Error ? error.message : 'Please try again.',
        duration: 5000,
      })
      // Restore message on error
      setNewMessage(messageText)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col z-50 flex-shrink-0">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border border-gray-600 overflow-hidden bg-gray-700 flex items-center justify-center">
              <span className="text-white font-bold">
                {teacher.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{teacher.name}</h4>
            <p className="text-[10px] text-green-500 font-medium uppercase tracking-wider">Online</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-0" 
        ref={scrollRef}
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.is_me ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                    msg.is_me
                      ? 'bg-orange-600 text-white rounded-tr-none'
                      : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                  )}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={cn('text-[10px] mt-1', msg.is_me ? 'text-orange-200' : 'text-gray-500')}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0 p-4 bg-gray-800/50 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-gray-900 border-gray-700 text-white focus:border-orange-500 transition-colors h-10"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white shrink-0 h-10 w-10"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-[10px] text-gray-500 mt-2 text-center">
          Messages are encrypted and real-time via Pusher
        </p>
      </div>
    </div>
  )
}

// Floating Chat Button Component
interface ChatButtonProps {
  onClick: () => void
  unreadCount?: number
  isOpen?: boolean
}

export function ChatButton({ onClick, unreadCount, isOpen }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
      aria-label={isOpen ? "Minimize chat" : "Open chat"}
    >
      {isOpen ? (
        <Minimize2 className="h-5 w-5" />
      ) : (
        <MessageSquare className="h-6 w-6" />
      )}
      {!isOpen && unreadCount !== undefined && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-gray-900 animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}

