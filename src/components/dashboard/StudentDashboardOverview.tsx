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
  Video
} from 'lucide-react'
import Link from 'next/link'
import { useEnrolledCourses } from '@/hooks/student/use-enrolled-courses'
import { useStudentBookedSlots } from '@/hooks/student/use-booked-slots'
import { Loader2 } from 'lucide-react'

export default function StudentDashboardOverview() {
  const { data: enrolledCourses = [], isLoading: coursesLoading } = useEnrolledCourses()
  const { data: bookedSlotsData, isLoading: slotsLoading } = useStudentBookedSlots(1)
  
  const bookedSlots = bookedSlotsData?.data || []
  const totalBookedSlots = bookedSlotsData?.total || 0
  
  // Calculate stats
  const stats = {
    enrolledCourses: enrolledCourses.length,
    bookedSlots: totalBookedSlots,
    completedCourses: enrolledCourses.filter((course: any) => course.progress === 100 || course.completed).length,
    upcomingSessions: bookedSlots.filter((slot: any) => {
      if (!slot.scheduled_date) return false
      const sessionDate = new Date(slot.scheduled_date)
      return sessionDate >= new Date() && slot.status === 'confirmed'
    }).length
  }

  // Get upcoming sessions (next 3)
  const upcomingSessions = bookedSlots
    .filter((slot: any) => {
      if (!slot.scheduled_date) return false
      const sessionDate = new Date(slot.scheduled_date)
      return sessionDate >= new Date() && slot.status === 'confirmed'
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.scheduled_date).getTime()
      const dateB = new Date(b.scheduled_date).getTime()
      return dateA - dateB
    })
    .slice(0, 3)

  // Get recent courses (latest 3)
  const recentCourses = enrolledCourses.slice(0, 3)

  const isLoading = coursesLoading || slotsLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back! Here&apos;s your learning overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Enrolled Courses</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stats.enrolledCourses}</p>
                )}
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Booked Sessions</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stats.bookedSlots}</p>
                )}
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Completed Courses</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-green-500 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stats.completedCourses}</p>
                )}
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Upcoming Sessions</p>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stats.upcomingSessions}</p>
                )}
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white pt-5">Upcoming Sessions</CardTitle>
                <CardDescription className="text-gray-400">Your next learning sessions</CardDescription>
              </div>
              <Link 
                href="/dashboard/student-booked-slots"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No upcoming sessions</p>
                <Link 
                  href="/courses"
                  className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
                >
                  Book a session
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((slot: any) => {
                  const sessionDate = slot.scheduled_date ? new Date(slot.scheduled_date) : null
                  const formattedDate = sessionDate 
                    ? sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Date TBD'
                  const formattedTime = slot.scheduled_start_time 
                    ? new Date(`1970-01-01T${slot.scheduled_start_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })
                    : 'Time TBD'
                  
                  return (
                    <div key={slot.id} className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Video className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {slot.slot?.teacher?.name || 'Master'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {slot.slot?.subject?.name || 'General Subject'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{formattedDate}</span>
                          <span>•</span>
                          <span>{formattedTime}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white pt-5">My Courses</CardTitle>
                <CardDescription className="text-gray-400">Continue your learning journey</CardDescription>
              </div>
              <Link 
                href="/dashboard/enrolled-courses"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : recentCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No enrolled courses yet</p>
                <Link 
                  href="/courses"
                  className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
                >
                  Browse courses
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCourses.map((course: any) => {
                  const progress = course.progress || 0
                  const courseTitle = course.course?.title || course.title || 'Untitled Course'
                  
                  return (
                    <Link
                      key={course.id || course.course_id}
                      href={`/courses/${course.course_id || course.course?.id}`}
                      className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {courseTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white pt-5">Quick Actions</CardTitle>
          <CardDescription className="text-gray-400">Get started with your learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/courses"
              className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700/50 group"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">Browse Courses</p>
                <p className="text-sm text-gray-400">Explore new courses</p>
              </div>
            </Link>

            <Link
              href="/courses"
              className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700/50 group"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Video className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Book Live Session</p>
                <p className="text-sm text-gray-400">Schedule with masters</p>
              </div>
            </Link>

            <Link
              href="/dashboard/enrolled-courses"
              className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700/50 group"
            >
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">My Progress</p>
                <p className="text-sm text-gray-400">Track your learning</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
