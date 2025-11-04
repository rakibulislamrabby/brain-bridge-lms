'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  user?: {
    id: number
    name: string
    email: string
  } | null
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const router = useRouter()

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

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
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
              <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
              </div>
              
              <div className="py-1">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                
                <div className="border-t border-gray-700 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
