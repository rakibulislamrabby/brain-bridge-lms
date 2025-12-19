'use client'

import React, { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserProfile } from '@/hooks/use-me'
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
  Video,
  FolderOpen,
  Target,
  Users,
  Calendar,
  UserCheck,
  CheckSquare
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  user?: UserProfile | null
}

export default function Sidebar({ isCollapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Check user roles
  const isAdmin = useMemo(() => {
    return user?.roles?.some(role => role.name === 'admin') || false
  }, [user])

  const isStudent = useMemo(() => {
    return user?.roles?.some(role => role.name === 'student') || false
  }, [user])

  const isTeacher = useMemo(() => {
    return user?.roles?.some(role => role.name === 'teacher') || false
  }, [user])

  const navigation = useMemo(() => {
    const allNavigation = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      items: [],
      allowedRoles: ['admin', 'teacher', 'student'] // Everyone can see Dashboard
    },
    {
      title: 'My Courses',
      icon: BookOpen,
      href: '/dashboard/enrolled-courses',
      items: [],
      allowedRoles: ['student'] // Students only
    },
    {
      title: 'My Booked Slots',
      icon: Calendar,
      href: '/dashboard/student-booked-slots',
      items: [],
      allowedRoles: ['student'] // Students only
    },
    {
      title: 'My In-Person Slots',
      icon: UserCheck,
      href: '/dashboard/student-booked-in-person-slots',
      items: [],
      allowedRoles: ['student'] // Students only
    },
    {
      title: 'My Course Requests',
      icon: BookOpen,
      href: '/dashboard/my-course-requests',
      items: [],
      allowedRoles: ['student'] // Students only
    },
    {
      title: 'Course Requests',
      icon: BookOpen,
      href: '/dashboard/course-requests',
      items: [],
      allowedRoles: ['admin'] // Only admin can see this
    },
    {
      title: 'Course Enrollments',
      icon: Users,
      href: '/dashboard/teacher-enrolled-courses',
      items: [],
      allowedRoles: ['admin', 'teacher'] // Admin and Teacher only
    },
    {
      title: 'Booked Slots',
      icon: Calendar,
      href: '/dashboard/teacher-booked-slots',
      items: [],
      allowedRoles: ['admin', 'teacher'] // Admin and Teacher only
    },
    {
      title: 'Booked In-Person Slots',
      icon: UserCheck,
      href: '/dashboard/teacher-booked-in-person-slots',
      items: [],
      allowedRoles: ['admin', 'teacher'] // Admin and Teacher only
    },
    {
      title: 'Course',
      icon: BookOpen,
      href: '/dashboard/course',
      items: [
        { title: 'All Courses', href: '/dashboard/course', icon: BookOpen },
        { title: 'Add Course', href: '/dashboard/course/add-course', icon: FileText },
        { title: 'Select Main Course', href: '/dashboard/course/add-selected-course', icon: CheckSquare }
      ],
      allowedRoles: ['admin', 'teacher'] // Admin and Teacher only
    },
    {
      title: 'Live Session',
      icon: Video,
      href: '/dashboard/one-to-one-session',
      items: [
        { title: 'All Slots', href: '/dashboard/one-to-one-session', icon: Video },
        { title: 'Add Slot', href: '/dashboard/one-to-one-session/add-slot', icon: FileText },
      ],
      allowedRoles: ['admin', 'teacher'] // Admin and Teacher only
    },
    {
      title: 'In Person',
      icon: UserCheck,
      href: '/dashboard/in-person-session',
      items: [
        { title: 'All In Person Slots', href: '/dashboard/in-person-session', icon: Calendar },
        { title: 'Add In Person Slot', href: '/dashboard/in-person-session/add-slot', icon: FileText },
      ],
      allowedRoles: ['admin', 'teacher'] // Admin and Teacher only
    },
    {
      title: 'Subject',
      icon: FolderOpen,
      href: '/dashboard/subject',
      items: [],
      allowedRoles: ['admin', 'teacher'] // Admin and Teacher only
    },
    {
      title: 'Skills',
      icon: Target,
      href: '/dashboard/skills',
      items: [],
      allowedRoles: ['admin', 'teacher'] // Admin and Teacher only
    },
    {
      title: 'Chat',
      icon: MessageSquare,
      href: '/dashboard/teacher-chat',
      items: [],
      allowedRoles: ['admin', 'teacher'] // Admin and Teacher only
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
      title: 'User List',
      icon: Users,
      href: '/dashboard/user-list',
      items: [],
      allowedRoles: ['admin',] // Only admin can see this
    },
    {
      title: 'Teacher List',
      icon: GraduationCap,
      href: '/dashboard/teacher-list',
      items: [],
      allowedRoles: ['admin',] // Only admin can see this
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      items: [],
      allowedRoles: ['admin', 'teacher', 'student'] // Everyone can see Settings
    }
    ]

    // Filter navigation based on user role
    return allNavigation.filter(item => {
      // Check if user has any of the allowed roles for this item
      if (isAdmin) {
        // Admin can see items with 'admin' role, but not student-only items
        return item.allowedRoles?.includes('admin') || false
      }
      
      if (isTeacher) {
        // Teachers can only see items that explicitly include 'teacher' role
        // They cannot see admin-only items unless 'teacher' is also in allowedRoles
        return item.allowedRoles?.includes('teacher') || false
      }
      
      if (isStudent) {
        // Students can only see items with 'student' role
        return item.allowedRoles?.includes('student') || false
      }
      
      // Default: if no role matches, don't show the item
      return false
    })
  }, [isAdmin, isStudent, isTeacher])

  const isActive = useCallback((href: string, hasSubItems: boolean = false) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    // Exact match
    if (pathname === href) {
      return true
    }
    // For items with sub-items, only match exact or sub-paths (with trailing slash)
    // This prevents /dashboard/course-requests from matching /dashboard/course
    if (hasSubItems) {
      return pathname.startsWith(href + '/')
    }
    // For items without sub-items, use startsWith but be careful
    // Only match if it's a sub-path (has trailing slash) to avoid false matches
    return pathname.startsWith(href + '/')
  }, [pathname])

  // Auto-expand parent when sub-item is active
  React.useEffect(() => {
    navigation.forEach(item => {
      if (item.items.length > 0) {
        // Only check sub-items, not the parent href itself
        const hasActiveSubItem = item.items.some(subItem => {
          if (subItem.href === '/dashboard') {
            return pathname === '/dashboard'
          }
          // Use exact match or sub-path matching
          if (pathname === subItem.href) {
            return true
          }
          return pathname.startsWith(subItem.href + '/')
        })
        if (hasActiveSubItem && !expandedItems.includes(item.title)) {
          setExpandedItems(prev => [...prev, item.title])
        }
      }
    })
  }, [pathname, expandedItems, navigation])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  return (
    <div className={cn(
      "flex flex-col h-screen bg-gray-800 border-r border-gray-700 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2 py-2">
            <GraduationCap className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold text-white">Brain Bridge</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-300" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const hasSubItems = item.items.length > 0
          const isItemActive = isActive(item.href, hasSubItems)
          const isExpanded = expandedItems.includes(item.title)

          return (
            <div key={item.title}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    "flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isItemActive
                      ? "bg-orange-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
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
                      ? "bg-orange-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
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
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-gray-400 hover:bg-gray-700"
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
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed && (
          <div className="text-xs text-gray-400 text-center">
            Brain Bridge v1.0
          </div>
        )}
      </div>
    </div>
  )
}
