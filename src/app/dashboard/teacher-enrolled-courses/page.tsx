'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStoredUser } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTeacherEnrolledCourses } from '@/hooks/teacher/use-enrolled-courses'
import { 
  BookOpen, 
  Loader2, 
  ExternalLink,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  User,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function TeacherEnrolledCoursesPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { addToast } = useToast()
  
  const { data: enrolledCourses, isLoading, error, refetch } = useTeacherEnrolledCourses()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/signin')
      return
    }
    setUser(storedUser)
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (error) {
      addToast({
        type: 'error',
        title: 'Failed to Load Enrollments',
        description: error instanceof Error ? error.message : 'Unable to fetch course enrollments. Please try again.',
        duration: 5000,
      })
    }
  }, [error, addToast])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date)
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: string | number | null | undefined, currency: string = 'usd') => {
    if (!amount) return '—'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '—'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(numAmount)
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-600/80 text-white">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-600/80 text-white">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-600/80 text-white">Failed</Badge>
      default:
        return <Badge className="bg-gray-600/80 text-white">{status || 'Unknown'}</Badge>
    }
  }

  const getEnrollmentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-600/80 text-white">Active</Badge>
      case 'completed':
        return <Badge className="bg-blue-600/80 text-white">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-600/80 text-white">Cancelled</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-600/80 text-white">Suspended</Badge>
      default:
        return <Badge className="bg-gray-600/80 text-white">{status || 'Unknown'}</Badge>
    }
  }

  const getProgressPercentage = (progress: string | null | undefined) => {
    if (!progress) return 0
    const numProgress = parseFloat(progress)
    return isNaN(numProgress) ? 0 : Math.round(numProgress)
  }

  // Calculate summary stats
  const totalEnrollments = enrolledCourses?.length || 0
  const totalRevenue = enrolledCourses?.reduce((sum, enrollment) => {
    const amount = parseFloat(enrollment.amount_paid || '0')
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0) || 0
  const activeEnrollments = enrolledCourses?.filter(e => e.status === 'active').length || 0
  const completedEnrollments = enrolledCourses?.filter(e => e.status === 'completed').length || 0

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="h-8 w-8 text-orange-500" />
              Course Enrollments
            </h1>
            <p className="text-gray-400 mt-2">
              View all students enrolled in your courses
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Refresh
          </Button>
        </div>

        {/* Summary Stats */}
        {enrolledCourses && enrolledCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Enrollments</p>
                    <p className="text-2xl font-bold text-white mt-1">{totalEnrollments}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Students</p>
                    <p className="text-2xl font-bold text-white mt-1">{activeEnrollments}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-white mt-1">{completedEnrollments}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enrollments Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <BookOpen className="h-5 w-5 text-orange-500" />
              Student Enrollments
            </CardTitle>
            <CardDescription className="text-gray-400">
              {enrolledCourses && enrolledCourses.length > 0
                ? `${totalEnrollments} student${totalEnrollments !== 1 ? 's' : ''} enrolled in your courses`
                : 'No enrollments found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!enrolledCourses || enrolledCourses.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No enrollments yet</p>
                <p className="text-sm mb-4">Students will appear here once they enroll in your courses.</p>
                <Link href="/dashboard/course">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Manage Courses
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse">
                  <thead className="bg-gray-900/60">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Course
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Subject
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Student
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Amount Paid
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Payment Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Enrollment Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Progress
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Enrolled At
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledCourses.map((enrollment) => {
                      const course = enrollment.course
                      const progress = getProgressPercentage(enrollment.progress_percentage)
                      
                      return (
                        <tr
                          key={enrollment.id}
                          className="border-t border-gray-700/60 hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {course.title || 'Untitled Course'}
                              </p>
                              <p className="text-xs text-gray-400 line-clamp-2 max-w-[300px] mt-1">
                                {course.description || 'No description provided.'}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-300">
                            {course.subject?.name || '—'}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-purple-400" />
                              <span>{enrollment.student?.name || `Student #${enrollment.student_id}`}</span>
                            </div>
                            {enrollment.student?.email && (
                              <p className="text-xs text-gray-400 mt-1">
                                {enrollment.student.email}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              {formatCurrency(enrollment.amount_paid, enrollment.currency)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {getPaymentStatusBadge(enrollment.payment_status)}
                          </td>
                          <td className="py-4 px-4">
                            {getEnrollmentStatusBadge(enrollment.status)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                  <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-purple-400" />
                              {formatDate(enrollment.enrolled_at)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Link href={`/courses/${course.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-600 text-blue-400 hover:bg-blue-900/30 cursor-pointer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Course
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

