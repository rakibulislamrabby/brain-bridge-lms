'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import StudentDashboardOverview from '@/components/dashboard/StudentDashboardOverview'
import AdminDashboardOverview from '@/components/dashboard/AdminDashboardOverview'
import TeacherDashboardOverview from '@/components/dashboard/TeacherDashboardOverview'
import { useMe } from '@/hooks/use-me'

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: userProfile, isLoading: profileLoading } = useMe()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/signin')
      return
    }
    setUser(storedUser)
    setLoading(false)
    // Note: userProfile will be refetched automatically due to refetchOnMount in useMe hook
  }, [router])

  // Determine user role
  const isStudent = useMemo(() => {
    return userProfile?.roles?.some(role => role.name === 'student') || false
  }, [userProfile])

  const isTeacher = useMemo(() => {
    return userProfile?.roles?.some(role => role.name === 'teacher') || false
  }, [userProfile])

  const isAdmin = useMemo(() => {
    return userProfile?.roles?.some(role => role.name === 'admin') || false
  }, [userProfile])

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      {isAdmin ? (
        <AdminDashboardOverview />
      ) : isStudent ? (
        <StudentDashboardOverview />
      ) : isTeacher ? (
        <TeacherDashboardOverview />
      ) : (
        <DashboardOverview />
      )}
    </DashboardLayout>
  )
}
