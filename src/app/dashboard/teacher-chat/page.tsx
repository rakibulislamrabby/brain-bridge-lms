'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useTeacherEnrolledCourses } from '@/hooks/teacher/use-enrolled-courses'
import { getStoredUser } from '@/hooks/useAuth'

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_MAIN_STORAGE_URL || process.env.NEXT_PUBLIC_MEDIA_BASE_URL || ''

const resolveAvatarUrl = (path?: string | null): string | null => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return null
  }

  // If already a full URL, return as is
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  // Prepend storage base URL
  if (!STORAGE_BASE_URL) {
    return null
  }
  
  const base = STORAGE_BASE_URL.endsWith('/') ? STORAGE_BASE_URL.slice(0, -1) : STORAGE_BASE_URL
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${cleanedPath}`
}

interface Message {
  id: string
  sender_id: number
  text: string
  timestamp: string
  is_me: boolean
}

interface Student {
  id: number
  name: string
  email: string
  avatar?: string
  course_id: number
  course_title: string
}

interface TeacherChatProps {
  student: Student
  currentUser: {
    id: number
    name: string
  }
}

function TeacherChatWindow({ student, currentUser }: TeacherChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender_id: currentUser.id,
      text: `Hello ${student.name}! How can I help you with ${student.course_title}?`,
      timestamp: new Date().toISOString(),
      is_me: true,
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

    // Simulate sending for now (UI only)
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
            {(() => {
              const avatarUrl = resolveAvatarUrl(student.avatar)
              return avatarUrl ? (
                <Image 
                  src={avatarUrl} 
                  alt={student.name} 
                  width={40} 
                  height={40} 
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-white font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              )
            })()}
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">{student.name}</h4>
          <p className="text-[10px] text-gray-400">{student.course_title}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 p-4 overflow-y-auto custom-scrollbar" 
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

export default function TeacherChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: enrolledCourses = [], isLoading } = useTeacherEnrolledCourses()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/signin')
      return
    }
    setUser(storedUser)
  }, [router])

  // Extract unique students from enrolled courses
  const students = useMemo(() => {
    const studentMap = new Map<number, Student>()
    
    enrolledCourses.forEach((enrollment: any) => {
      if (enrollment.student && enrollment.payment_status?.toLowerCase() === 'paid') {
        const studentId = enrollment.student.id
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: enrollment.student.id,
            name: enrollment.student.name,
            email: enrollment.student.email,
            avatar: enrollment.student.profile_picture,
            course_id: enrollment.course_id,
            course_title: enrollment.course.title,
          })
        }
      }
    })
    
    return Array.from(studentMap.values())
  }, [enrolledCourses])

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    const query = searchQuery.toLowerCase()
    return students.filter(
      student => 
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.course_title.toLowerCase().includes(query)
    )
  }, [students, searchQuery])

  // Auto-select first student if none selected
  useEffect(() => {
    if (!selectedStudent && filteredStudents.length > 0) {
      setSelectedStudent(filteredStudents[0])
    }
  }, [filteredStudents, selectedStudent])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)] bg-gray-900 rounded-lg border border-gray-700 overflow-hidden -m-6">
      {/* Left Sidebar: Student List */}
      <div className="w-80 border-r border-gray-700 bg-gray-800/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            Students ({students.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white focus:border-orange-500"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredStudents.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No students found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-4 text-left hover:bg-gray-700/50 transition-colors ${
                      isSelected ? 'bg-orange-500/10 border-l-4 border-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="h-10 w-10 rounded-full border border-gray-600 overflow-hidden bg-gray-700 flex items-center justify-center">
                          {(() => {
                            const avatarUrl = resolveAvatarUrl(student.avatar)
                            return avatarUrl ? (
                              <Image 
                                src={avatarUrl} 
                                alt={student.name} 
                                width={40} 
                                height={40} 
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            )
                          })()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-orange-400' : 'text-white'}`}>
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{student.email}</p>
                        <p className="text-[10px] text-gray-500 mt-1 truncate">{student.course_title}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedStudent && user ? (
          <TeacherChatWindow student={selectedStudent} currentUser={user} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Select a student to start chatting</p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
      </div>
    </DashboardLayout>
  )
}

