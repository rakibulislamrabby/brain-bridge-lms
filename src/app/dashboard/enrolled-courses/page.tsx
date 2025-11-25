'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStoredUser } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEnrolledCourses } from '@/hooks/student/use-enrolled-courses'
import { 
  BookOpen, 
  Loader2, 
  ExternalLink,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Star
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import CourseReviewModal from '@/components/shared/reviews/CourseReviewModal'

export default function EnrolledCoursesPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { addToast } = useToast()
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>('')
  const [reviewedCourses, setReviewedCourses] = useState<Set<number>>(new Set())
  
  const { data: enrolledCourses, isLoading, error, refetch } = useEnrolledCourses()

  // Load reviewed courses from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('reviewed_courses')
        if (stored) {
          const parsed = JSON.parse(stored) as number[]
          setReviewedCourses(new Set(parsed))
        }
      } catch (error) {
        console.error('Failed to load reviewed courses:', error)
      }
    }
  }, [])

  // Listen for review submission events
  useEffect(() => {
    const handleReviewSubmitted = (event: Event) => {
      const customEvent = event as CustomEvent<{ courseId: number }>
      const courseId = customEvent.detail?.courseId
      if (courseId) {
        setReviewedCourses(prev => {
          const newSet = new Set(prev)
          newSet.add(courseId)
          // Save to localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('reviewed_courses', JSON.stringify(Array.from(newSet)))
            } catch (error) {
              console.error('Failed to save reviewed courses:', error)
            }
          }
          return newSet
        })
        refetch()
      }
    }

    const handleAlreadyReviewed = (event: Event) => {
      const customEvent = event as CustomEvent<{ courseId: number }>
      const courseId = customEvent.detail?.courseId
      if (courseId) {
        setReviewedCourses(prev => {
          const newSet = new Set(prev)
          newSet.add(courseId)
          // Save to localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('reviewed_courses', JSON.stringify(Array.from(newSet)))
            } catch (error) {
              console.error('Failed to save reviewed courses:', error)
            }
          }
          return newSet
        })
      }
    }

    window.addEventListener('courseReviewSubmitted', handleReviewSubmitted)
    window.addEventListener('courseAlreadyReviewed', handleAlreadyReviewed)

    return () => {
      window.removeEventListener('courseReviewSubmitted', handleReviewSubmitted)
      window.removeEventListener('courseAlreadyReviewed', handleAlreadyReviewed)
    }
  }, [refetch])

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
        title: 'Failed to Load Courses',
        description: error instanceof Error ? error.message : 'Unable to fetch enrolled courses. Please try again.',
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

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
              <BookOpen className="h-8 w-8 text-orange-500" />
              My Enrolled Courses
            </h1>
            <p className="text-gray-400 mt-2">
              View and manage all your enrolled courses
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

        {/* Courses Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <BookOpen className="h-5 w-5 text-orange-500" />
              Enrolled Courses
            </CardTitle>
            <CardDescription className="text-gray-400">
              {enrolledCourses && enrolledCourses.length > 0
                ? `You have enrolled in ${enrolledCourses.length} course${enrolledCourses.length !== 1 ? 's' : ''}`
                : 'No enrolled courses found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!enrolledCourses || enrolledCourses.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No enrolled courses</p>
                <p className="text-sm mb-4">Start exploring courses to enroll in them!</p>
                <Link href="/courses">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Browse Courses
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
                        Teacher
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
                            {course.teacher?.name || '—'}
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
                            <div className="flex items-center gap-2">
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
                              {enrollment.payment_status?.toLowerCase() === 'paid' && (
                                reviewedCourses.has(course.id) ? (
                                  <Badge className="bg-green-600/80 text-white flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    Reviewed
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCourseId(course.id)
                                      setSelectedCourseTitle(course.title || 'this course')
                                      setReviewModalOpen(true)
                                    }}
                                    className="border-purple-600 text-purple-400 hover:bg-purple-900/30 cursor-pointer"
                                  >
                                    <Star className="h-4 w-4 mr-2" />
                                    Review
                                  </Button>
                                )
                              )}
                            </div>
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

      {/* Review Modal */}
      {selectedCourseId && (
        <CourseReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          courseId={selectedCourseId}
          courseTitle={selectedCourseTitle}
        />
      )}
    </DashboardLayout>
  )
}

