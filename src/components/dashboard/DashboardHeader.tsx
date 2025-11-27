'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, User, LogOut, Settings, ChevronDown, Award, TrendingUp, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserProfile } from '@/hooks/use-me'
import { useTeacherLevelProgress } from '@/hooks/teacher/use-teacher-level-progress'
import { useLatestNotification } from '@/hooks/notifications/use-latest-notification'
import { useNotifications } from '@/hooks/notifications/use-notifications'
import NotificationDropdown from './NotificationDropdown'

interface DashboardHeaderProps {
  user?: UserProfile | null
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const router = useRouter()

  const isTeacher = useMemo(() => {
    return user?.roles?.some(role => role.name === 'teacher') || false
  }, [user])
  
  const { data: levelProgress } = useTeacherLevelProgress(isTeacher)
  const { data: latestNotificationData } = useLatestNotification(isTeacher)
  // Fetch first page to get unread count - only for teachers
  const { data: notificationsData } = useNotifications(1, isTeacher)
  
  // Calculate unread count from first page of notifications
  const unreadCount = useMemo(() => {
    if (!notificationsData?.notifications?.data) {
      // Fallback: check if latest notification is unread
      if (latestNotificationData?.notification && !latestNotificationData.notification.read_at) {
        return 1
      }
      return 0
    }
    // Get unread count from first page (up to per_page limit)
    const unread = notificationsData.notifications.data.filter(n => !n.read_at).length
    // If all items on first page are unread and there are more pages, show "+" indicator
    if (unread === notificationsData.notifications.per_page && notificationsData.notifications.current_page < notificationsData.notifications.last_page) {
      return unread
    }
    return unread
  }, [notificationsData, latestNotificationData])
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    // Redirect to signin page
    router.push('/signin')
  }

  const handleProfileClick = () => {
    // Navigate to profile page
    router.push('/dashboard/profile')
  }

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Home Button */}
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-orange-400 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Home className="h-5 w-5" />
          <span className="font-medium">Home</span>
        </Link>

        {/* Teacher Level Progress - Center */}
        {isTeacher && levelProgress && (
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-400" />
              <div className="text-left">
                <p className="text-xs text-gray-400">Level Progress</p>
                <p className="text-sm font-semibold text-white">
                  {levelProgress.current_level.name} → {levelProgress.next_level?.name || 'Max Level'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <div className="text-left">
                <p className="text-xs text-gray-400">Progress</p>
                <p className="text-sm font-bold text-green-400">
                  {levelProgress.progress_percent.toFixed(0)}%
                </p>
              </div>
            </div>
            {!levelProgress.is_max_level && levelProgress.next_level && (
              <div className="w-32 bg-gray-600 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, levelProgress.progress_percent)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Icon - Only for teachers */}
          {user && isTeacher && (
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen)
                  setIsProfileOpen(false)
                }}
                className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Bell className="h-5 w-5 text-gray-300 hover:text-orange-400 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-gray-800">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                unreadCount={unreadCount}
              />
            </div>
          )}

          {/* Profile Section */}
          <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen)
              setIsNotificationOpen(false)
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {/* Profile Avatar */}
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
              {user?.name ? (
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            
            {/* User Info */}
            <div className="text-left">
              <p className="text-sm font-medium text-white">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              isProfileOpen && "rotate-180"
            )} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
              {/* <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
              </div> */}
              
              <div className="py-1">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                
                <div className="border-t border-gray-700 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  )
}
