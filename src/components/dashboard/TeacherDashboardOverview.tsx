'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  DollarSign,
  Loader2,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react'
import { useDashboardInfo, isTeacherDashboardInfo, TeacherDashboardInfo } from '@/hooks/dashboard/use-dashboard-info'

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL

const resolveMediaUrl = (path?: string | null) => {
  if (!path) {
    return null
  }

  // If already a full URL, return as is
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  if (!MEDIA_BASE_URL) {
    return null
  }

  const base = MEDIA_BASE_URL.endsWith('/')
    ? MEDIA_BASE_URL
    : `${MEDIA_BASE_URL}/`

  const cleanedPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '')
  return `${base}storage/${cleanedPath}`
}

export default function TeacherDashboardOverview() {
  const { data: dashboardData, isLoading, error } = useDashboardInfo()

  const teacherData = isTeacherDashboardInfo(dashboardData) ? dashboardData : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
          <p className="text-gray-400 mt-2">Loading dashboard information...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
          <p className="text-gray-400 mt-2">Error loading dashboard information</p>
        </div>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-red-400">
              {error instanceof Error ? error.message : 'Failed to load dashboard data'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!teacherData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
          <p className="text-gray-400 mt-2">No dashboard data available</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome to your teaching dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">My Courses</p>
                <p className="text-2xl font-bold text-white">{teacherData.myCourses.toLocaleString()}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(teacherData.enrolledCoursesEarning)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Courses */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 pt-5">
            <BookOpen className="h-5 w-5 text-purple-500" />
            Latest Courses
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your recently created or updated courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacherData.latestCourse && teacherData.latestCourse.length > 0 ? (
            <div className="space-y-4">
              {teacherData.latestCourse.map((course) => {
                const thumbnailUrl = resolveMediaUrl(course.thumbnail_url)
                return (
                  <div
                    key={course.id}
                    className="border border-gray-700 rounded-lg p-4 bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Thumbnail */}
                      <div className="w-full md:w-32 h-32 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-1 truncate">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                              {course.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">Price:</span>
                                <span className="text-green-400 font-medium">
                                  {formatCurrency(course.price)}
                                </span>
                                {course.old_price && parseFloat(course.old_price) > parseFloat(course.price) && (
                                  <span className="text-gray-500 line-through">
                                    {formatCurrency(course.old_price)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">Enrollments:</span>
                                <span className="text-white font-medium">
                                  {course.enrollment_count}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                course.is_published === 1
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {course.is_published === 1 ? 'Published' : 'Draft'}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                course.processing_status === 'approved'
                                  ? 'bg-green-500/20 text-green-400'
                                  : course.processing_status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {course.processing_status}
                            </span>
                            {course.is_main === 1 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                                Main Course
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Created: {formatDate(course.created_at)} • Updated: {formatDate(course.updated_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No courses found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
