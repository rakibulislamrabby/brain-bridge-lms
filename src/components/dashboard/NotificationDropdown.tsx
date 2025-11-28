'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Award, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/notifications/use-notifications'
import { Notification } from '@/hooks/notifications/use-notifications'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  unreadCount: number
}

export default function NotificationDropdown({ isOpen, onClose, unreadCount }: NotificationDropdownProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: notificationsData, isLoading } = useNotifications(currentPage, isOpen)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const notifications = notificationsData?.notifications?.data || []
  const totalPages = notificationsData?.notifications?.last_page || 1

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) return 'Just now'
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
      }
      if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400)
        return `${days} day${days > 1 ? 's' : ''} ago`
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
    } catch {
      return 'Recently'
    }
  }

  const getNotificationIcon = (notification: Notification) => {
    if (notification.type.includes('TeacherPromoted')) {
      return <Award className="h-5 w-5 text-yellow-400" />
    }
    return <Sparkles className="h-5 w-5 text-blue-400" />
  }

  // Reset page when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-400" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="h-12 w-12 text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm font-medium">No notifications</p>
            <p className="text-gray-500 text-xs mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => {
              const isUnread = !notification.read_at
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'px-4 py-3 hover:bg-gray-700/50 transition-colors cursor-pointer',
                    isUnread && 'bg-gray-700/30'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-white text-sm font-medium leading-snug">
                          {notification.data.message}
                        </p>
                        {isUnread && (
                          <div className="h-2 w-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-xs">
                          {formatTime(notification.created_at)}
                        </span>
                        {notification.data.level && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded text-yellow-400 text-xs font-medium">
                            {notification.data.level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              currentPage === 1
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-orange-400 hover:bg-orange-500/20'
            )}
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              currentPage === totalPages
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-orange-400 hover:bg-orange-500/20'
            )}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

