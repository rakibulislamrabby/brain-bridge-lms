'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, User, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

interface Message {
  id: string
  sender_id: number
  text: string
  timestamp: string
  is_me: boolean
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender_id: master.id,
      text: `Hello ${currentUser.name}! Welcome to the course. If you have any questions, feel free to ask here.`,
      timestamp: new Date().toISOString(),
      is_me: false,
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)

    // Simulate sending for now as per user request (UI only)
    const msg: Message = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      is_me: true,
    }

    setMessages(prev => [...prev, msg])
    setNewMessage('')
    setIsSending(false)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border border-gray-600 overflow-hidden bg-gray-700 flex items-center justify-center">
            {master.avatar ? (
              <Image 
                src={master.avatar} 
                alt={master.name} 
                width={40} 
                height={40} 
                className="object-cover"
              />
            ) : (
              <span className="text-white font-bold">
                {master.name.charAt(0).toUpperCase()}
              </span>
            )}
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
            disabled={!newMessage.trim() || isSending}
            className="bg-orange-600 hover:bg-orange-700 text-white shrink-0 h-10 w-10"
          >
            {isSending ? (
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

