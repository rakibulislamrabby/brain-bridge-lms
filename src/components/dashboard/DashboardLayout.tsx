'use client'

import React, { useState } from 'react'
import { useMe } from '@/hooks/use-me'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { data: user, isLoading } = useMe()

  const toggleSidebar = () => { 
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Sidebar - Full Height */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
        user={user}
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
