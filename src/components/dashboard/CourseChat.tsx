'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useChatMessages, useSendMessage, ChatMessage } from '@/hooks/chat/use-chat'
import { subscribeToChat } from '@/lib/pusher'
import { useToast } from '@/components/ui/toast'
import { useQueryClient } from '@tanstack/react-query'

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

interface CourseChatProps {
  courseId: number
  master: {
    id: number
    name: string
    avatar?: string
  }
  currentUser: {
    id: number
    name: string
  }
}

export default function CourseChat({ courseId, master, currentUser }: CourseChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  
  // Use master.id as chatId (receiver_id from student's perspective for API)
  const chatId = master.id
  
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
    }))
  }, [messagesData, currentUser.id])

  // Subscribe to Pusher for real-time updates
  // Use both user IDs to create consistent channel name
  useEffect(() => {
    const unsubscribe = subscribeToChat(
      currentUser.id,
      master.id,
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
  }, [currentUser.id, master.id, chatId, queryClient])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sendMessageMutation.isPending) return

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      await sendMessageMutation.mutateAsync({
        receiver_id: master.id,
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

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border border-gray-600 overflow-hidden bg-gray-700 flex items-center justify-center">
            {(() => {
              const avatarUrl = resolveAvatarUrl(master.avatar)
              return avatarUrl ? (
                <Image 
                  src={avatarUrl} 
                  alt={master.name} 
                  width={40} 
                  height={40} 
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-white font-bold">
                  {master.name.charAt(0).toUpperCase()}
                </span>
              )
            })()}
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">{master.name}</h4>
          <p className="text-[10px] text-green-500 font-medium uppercase tracking-wider">Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 p-4 overflow-y-auto custom-scrollbar h-[calc(100vh-350px)]" 
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
                className={`flex ${msg.is_me ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.is_me
                      ? 'bg-orange-600 text-white rounded-tr-none'
                      : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.is_me ? 'text-orange-200' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
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

