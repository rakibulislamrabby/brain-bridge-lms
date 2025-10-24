'use client'

import React, { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  FileText,
  BarChart3,
  MessageSquare,
  Video
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const navigation = useMemo(() => [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      items: []
    },
    {
      title: 'Course',
      icon: BookOpen,
      href: '/dashboard/course',
      items: [
        { title: 'All Courses', href: '/dashboard/course', icon: BookOpen },
        { title: 'Categories', href: '/dashboard/course/categories', icon: FileText },
        { title: 'Content', href: '/dashboard/course/content', icon: Video },
        { title: 'Analytics', href: '/dashboard/course/analytics', icon: BarChart3 },
        { title: 'Reviews', href: '/dashboard/course/reviews', icon: MessageSquare }
      ]
    },
    // {
    //   title: 'Teacher',
    //   icon: Users,
    //   href: '/dashboard/teacher',
    //   items: [
    //     { title: 'All Teachers', href: '/dashboard/teacher/all', icon: Users },
    //     { title: 'Teacher Levels', href: '/dashboard/teacher/levels', icon: Award },
    //     { title: 'Performance', href: '/dashboard/teacher/performance', icon: BarChart3 },
    //     { title: 'Approvals', href: '/dashboard/teacher/approvals', icon: UserCheck },
    //     { title: 'Earnings', href: '/dashboard/teacher/earnings', icon: Award }
    //   ]
    // },
    {
      title: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      items: []
    }
  ], [])

  const isActive = useCallback((href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }, [pathname])

  // Auto-expand parent when sub-item is active
  React.useEffect(() => {
    navigation.forEach(item => {
      if (item.items.length > 0) {
        const hasActiveSubItem = item.items.some(subItem => isActive(subItem.href))
        if (hasActiveSubItem && !expandedItems.includes(item.title)) {
          setExpandedItems(prev => [...prev, item.title])
        }
      }
    })
  }, [pathname, expandedItems, isActive, navigation])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4  border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2 py-2">
            <GraduationCap className="h-8 w-8 text-orange-600" />
            <span className="text-xl font-bold text-gray-900">Brain Bridge</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isItemActive = isActive(item.href)
          const hasSubItems = item.items.length > 0
          const isExpanded = expandedItems.includes(item.title)

          return (
            <div key={item.title}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    "flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isItemActive
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </div>
                  {!isCollapsed && (
                    isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isItemActive
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )}

              {/* Sub Items */}
              {hasSubItems && !isCollapsed && isExpanded && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.items.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = pathname === subItem.href

                    return (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isSubActive
                            ? "bg-orange-50 text-orange-600"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <SubIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{subItem.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="text-xs text-gray-600 text-center">
            Brain Bridge v1.0
          </div>
        )}
      </div>
    </div>
  )
}
