'use client'

import React, { useState } from 'react'
import { getStoredUser } from '@/hooks/useAuth'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)

  const toggleSidebar = () => { 
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Get user data for header
  React.useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
  }, [])

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Sidebar - Full Height */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <DashboardHeader user={user} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-900">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
