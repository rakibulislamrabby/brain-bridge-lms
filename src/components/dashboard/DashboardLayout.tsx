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
  const [user, setUser] = useState<any>(null)

  const toggleSidebar = () => { 
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Get user data for header
  React.useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
  }, [])

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Dashboard Header */}
      <DashboardHeader user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
