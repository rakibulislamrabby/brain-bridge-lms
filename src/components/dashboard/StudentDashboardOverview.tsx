'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Star,
  ArrowRight,
  Video,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { useDashboardInfo, isStudentDashboardInfo, StudentDashboardInfo } from '@/hooks/dashboard/use-dashboard-info'
import { Loader2 } from 'lucide-react'

export default function StudentDashboardOverview() {
  const { data: dashboardData, isLoading, error } = useDashboardInfo()
  
  const studentData = isStudentDashboardInfo(dashboardData) ? dashboardData : null
  
  // Calculate stats from dashboard data
  const stats = {
    enrolledCourses: studentData?.enrolledCourses || 0,
    courserequest: studentData?.courserequest || 0,
    latestcourserequest: studentData?.latestcourserequest || []
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
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
          <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
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

  if (!studentData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
          <p className="text-gray-400 mt-2">No dashboard data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back! Here&apos;s your learning overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Enrolled Courses</p>
                <p className="text-2xl font-bold text-white">{stats.enrolledCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Course Requests</p>
                <p className="text-2xl font-bold text-white">{stats.courserequest}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Course Requests */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white pt-5">Latest Course Requests</CardTitle>
              <CardDescription className="text-gray-400">Your recent course requests</CardDescription>
            </div>
            <Link 
              href="/dashboard/my-course-requests"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats.latestcourserequest && stats.latestcourserequest.length > 0 ? (
            <div className="space-y-4">
              {stats.latestcourserequest.map((request: any, index: number) => (
                <div
                  key={request.id || index}
                  className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {request.title || request.course_title || 'Course Request'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {request.description || request.course_description || 'No description'}
                    </p>
                    {request.status && (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                          request.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : request.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {request.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No course requests yet</p>
              <Link 
                href="/dashboard/my-course-requests"
                className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
              >
                Create a course request
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
