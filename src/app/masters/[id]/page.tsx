'use client'

import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTeacherDetails } from '@/hooks/teacher/use-teacher-details'
import {
  ArrowLeft,
  Star,
  Users,
  Award,
  Loader2,
  Calendar,
  Clock,
  DollarSign,
  BookOpen,
  Play,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Video,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react'
import Image from 'next/image'

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_MAIN_STORAGE_URL || ''

const resolveMediaUrl = (path?: string | null): string | null => {
  if (!path || typeof path !== 'string') {
    return null
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const base = STORAGE_BASE_URL.endsWith('/') ? STORAGE_BASE_URL.slice(0, -1) : STORAGE_BASE_URL
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${cleanedPath}`
}

const resolveThumbnailUrl = (path?: string | null): string | null => {
  if (!path || typeof path !== 'string') {
    return null
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const base = STORAGE_BASE_URL.endsWith('/') ? STORAGE_BASE_URL.slice(0, -1) : STORAGE_BASE_URL
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path
  
  // Handle thumbnails path
  if (cleanedPath.startsWith('thumbnails/')) {
    return `${base}/${cleanedPath}`
  }
  return `${base}/thumbnails/${cleanedPath}`
}

export default function MasterDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const teacherId = useMemo(() => {
    const id = params?.id
    if (typeof id === 'string') {
      const parsed = Number(id)
      return Number.isFinite(parsed) ? parsed : null
    }
    return null
  }, [params])

  const { data, isLoading, error } = useTeacherDetails(teacherId)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [showAllCourses, setShowAllCourses] = useState(false)
  const [showAllSlots, setShowAllSlots] = useState(false)

  const teacher = data?.teacher
  const courses = data?.courses || []
  const skills = data?.skills || []
  const availableSlots = data?.available_slots || []

  // Calculate stats
  const stats = useMemo(() => {
    if (!teacher) return null

    const mainCourses = courses.filter(c => c.is_main === 1)
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)

    return {
      totalSessions: teacher.total_sessions || 0,
      averageRating: teacher.average_rating || 0,
      fiveStarReviews: teacher.five_star_reviews || 0,
      streakSessions: teacher.streak_good_sessions || 0,
      rebookCount: teacher.rebook_count || 0,
      cancelledSessions: teacher.cancelled_sessions || 0,
      totalCourses: courses.length,
      mainCourses: mainCourses.length,
      totalEnrollments,
      availableSlotsCount: availableSlots.length,
    }
  }, [teacher, courses, availableSlots])

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
        </div>
        <Footer />
      </>
    )
  }

  if (error || !teacher) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-20">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800/70 mb-6 cursor-pointer"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Card className="bg-red-900/20 border border-red-700/60">
              <CardContent className="py-16 text-center">
                <p className="text-red-200/90">
                  {error instanceof Error ? error.message : 'Teacher not found. Please try again.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const introductionVideoUrl = teacher.introduction_video ? resolveMediaUrl(teacher.introduction_video) : null

  return (
    <>
      <AppHeader />
      <main className="bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-gray-800/70 mb-6 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Hero Section */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-orange-500/10 to-blue-500/10 rounded-2xl blur-3xl -z-10"></div>
              
              <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Section */}
                    <div className="flex-shrink-0">
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center overflow-hidden border-4 border-gray-700">
                        {teacher.id ? (
                          <span className="text-4xl font-bold text-white">
                            {teacher.id.toString().charAt(0)}
                          </span>
                        ) : (
                          <Users className="w-16 h-16 text-white" />
                        )}
                      </div>
                      {introductionVideoUrl && (
                        <Button
                          onClick={() => setSelectedVideo(introductionVideoUrl)}
                          className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch Introduction
                        </Button>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold text-white mb-2">
                            Master Profile
                          </h1>
                          <p className="text-xl text-orange-400 mb-2">{teacher.title}</p>
                          <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-white font-medium">
                                {teacher.average_rating.toFixed(1)}
                              </span>
                              <span className="text-gray-500">({teacher.five_star_reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="text-xs text-gray-400">Total Sessions</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span className="text-xs text-gray-400">Streak</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.streakSessions}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-gray-400">Courses</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-orange-400" />
                              <span className="text-xs text-gray-400">Slots</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.availableSlotsCount}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Skills Section */}
          {skills.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-400" />
                  Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm py-2 px-4"
                    >
                      {skill.name}
                      {skill.pivot?.years_of_experience && (
                        <span className="ml-2 text-purple-400">
                          • {skill.pivot.years_of_experience} {skill.pivot.years_of_experience === 1 ? 'year' : 'years'}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses Section */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                  Courses ({courses.length})
                </h2>
                {stats && (
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      {stats.mainCourses} Main
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      {stats.totalEnrollments} Enrollments
                    </span>
                  </div>
                )}
              </div>

              {courses.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No courses available yet.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(showAllCourses ? courses : courses.slice(0, 6)).map((course) => {
                    const thumbnailUrl = resolveThumbnailUrl(course.thumbnail_url)
                    const isMain = course.is_main === 1
                    
                    return (
                      <Card
                        key={course.id}
                        className={`bg-gray-900 border-2 transition-all duration-200 hover:border-orange-500/50 ${
                          isMain ? 'border-orange-500/50' : 'border-gray-700'
                        }`}
                      >
                        <CardContent className="p-4">
                          {thumbnailUrl && (
                            <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-800">
                              <Image
                                src={thumbnailUrl}
                                alt={course.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              {isMain && (
                                <Badge className="absolute top-2 right-2 bg-orange-600 text-white">
                                  Main
                                </Badge>
                              )}
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {course.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {course.old_price && Number(course.old_price) > Number(course.price) && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${Number(course.old_price).toFixed(2)}
                                </span>
                              )}
                              <span className="text-lg font-bold text-orange-400">
                                ${Number(course.price).toFixed(2)}
                              </span>
                            </div>
                            <Badge
                              variant={course.is_published === 1 ? 'default' : 'secondary'}
                              className={
                                course.is_published === 1
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                  : 'bg-gray-700 text-gray-300'
                              }
                            >
                              {course.is_published === 1 ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                            <span>{course.enrollment_count || 0} enrolled</span>
                            <span className="capitalize">{course.processing_status}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  </div>
                  {courses.length > 6 && (
                    <div className="mt-6 text-center">
                      <Button
                        onClick={() => setShowAllCourses(!showAllCourses)}
                        variant="outline"
                        className="border-orange-600 text-orange-400 hover:bg-orange-900/30 cursor-pointer"
                      >
                        {showAllCourses ? 'Show Less' : `Show More (${courses.length - 6} more)`}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Available Slots Section */}
          {availableSlots.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  Available Sessions ({availableSlots.length})
                </h2>

                {availableSlots.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No sessions available yet.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(showAllSlots ? availableSlots : availableSlots.slice(0, 6)).map((slot) => {
                        const totalDays = Object.keys(slot.daily_available_seats).length
                        const totalAvailable = Object.values(slot.daily_available_seats).reduce(
                          (sum, day) => sum + day.available,
                          0
                        )
                        const totalBooked = Object.values(slot.daily_available_seats).reduce(
                          (sum, day) => sum + day.booked,
                          0
                        )

                        return (
                          <Card key={slot.id} className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">{slot.title}</h3>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize text-xs ml-2 flex-shrink-0">
                                  {slot.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{slot.description}</p>
                              
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                  <span className="truncate">
                                    {new Date(slot.from_date).toLocaleDateString()} - {new Date(slot.to_date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                  <span>
                                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  <span className="text-white font-medium">${slot.price}</span>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <div className="text-center">
                                  <p className="text-xs text-gray-400 mb-1">Days</p>
                                  <p className="text-lg font-bold text-white">{totalDays}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-400 mb-1">Available</p>
                                  <p className="text-lg font-bold text-green-400">{totalAvailable}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-400 mb-1">Booked</p>
                                  <p className="text-lg font-bold text-orange-400">{totalBooked}</p>
                                </div>
                              </div>

                              {/* Booked Slots Info */}
                              {slot.booked_slots.length > 0 && (
                                <div className="pt-3 border-t border-gray-700">
                                  <p className="text-xs text-gray-400 mb-2">
                                    {slot.booked_slots.length} booked
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {slot.booked_slots.slice(0, 3).map((booked, idx) => (
                                      <Badge
                                        key={idx}
                                        className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs"
                                      >
                                        {new Date(booked.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </Badge>
                                    ))}
                                    {slot.booked_slots.length > 3 && (
                                      <Badge className="bg-gray-700 text-gray-300 text-xs">
                                        +{slot.booked_slots.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                    {availableSlots.length > 6 && (
                      <div className="mt-6 text-center">
                        <Button
                          onClick={() => setShowAllSlots(!showAllSlots)}
                          variant="outline"
                          className="border-orange-600 text-orange-400 hover:bg-orange-900/30 cursor-pointer"
                        >
                          {showAllSlots ? 'Show Less' : `Show More (${availableSlots.length - 6} more)`}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Stats */}
          {stats && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  Performance Metrics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-1">Rebook Rate</p>
                    <p className="text-2xl font-bold text-white">{stats.rebookCount}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-1">Cancelled</p>
                    <p className="text-2xl font-bold text-red-400">{stats.cancelledSessions}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-1">5-Star Reviews</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.fiveStarReviews}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-1">Base Pay</p>
                    <p className="text-2xl font-bold text-green-400">${teacher.base_pay}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative max-w-4xl w-full bg-gray-900 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              className="absolute top-4 right-4 z-10 text-white hover:bg-gray-800"
              onClick={() => setSelectedVideo(null)}
            >
              <XCircle className="w-6 h-6" />
            </Button>
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full h-auto"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

