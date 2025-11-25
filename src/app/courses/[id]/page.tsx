'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { notFound, useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Footer from '@/components/shared/Footer'
import { useToast } from '@/components/ui/toast'
import { 
  Star, 
  Clock, 
  Users, 
  Play, 
  CheckCircle, 
  Award, 
  Globe,
  ArrowLeft,
  Share2,
  Heart,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { usePublicCourse, usePublicCourses } from '@/hooks/course/public/use-public-courses'
import { useCoursePaymentIntent } from '@/hooks/course/use-course-payment-intent'
import { Loader2, XCircle } from 'lucide-react'
import CourseReviewModal from '@/components/shared/reviews/CourseReviewModal'
import { useEnrolledCourses } from '@/hooks/student/use-enrolled-courses'
import { getStoredUser } from '@/hooks/useAuth'

const fallbackImage = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80'
const MEDIA_BASE_URL = 'https://brainbridge.mitwebsolutions.com/'

const resolveMediaUrl = (path?: string | null, fallback?: string) => {
  if (!path) {
    return fallback
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const base = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`
  
  // Handle different path formats: videos/, storage/, thumbnails/
  if (path.startsWith('videos/') || path.startsWith('/videos/')) {
    const cleanedPath = path.replace(/^\/?videos\//, '').replace(/^\/+/, '')
    return `${base}storage/videos/${cleanedPath}`
  }
  
  const cleanedPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '')
  return `${base}storage/${cleanedPath}`
}

const resolveThumbnailUrl = (path?: string | null, fallback?: string) => {
  if (!path) {
    return fallback
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const base = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`
  // Remove any leading storage/thumbnails/ or thumbnails/ or storage/ or slashes
  const cleanedPath = path
    .replace(/^\/?storage\/thumbnails\//, '')
    .replace(/^\/?thumbnails\//, '')
    .replace(/^\/?storage\//, '')
    .replace(/^\/+/, '')
  return `${base}storage/thumbnails/${cleanedPath}`
}

const getSubjectName = (course: any) => {
  return course?.subject?.name || course?.subject_name || 'General'
}

const getTeacherName = (course: any) => {
  return course?.teacher?.name || course?.teacher_name || 'Unknown Instructor'
}

const getModules = (course: any) => {
  if (Array.isArray(course?.modules)) {
    return course.modules
  }
  return []
}

const getModuleVideos = (module: any) => {
  if (Array.isArray(module?.video_lessons)) {
    return module.video_lessons
  }
  if (Array.isArray(module?.videos)) {
    return module.videos
  }
  return []
}

const getPriceLabel = (course: any) => {
  if (!course?.price && course?.price !== 0) {
    return '—'
  }
  const priceNumber = Number(course.price)
  if (Number.isNaN(priceNumber)) {
    return String(course.price)
  }
  return `$${priceNumber.toFixed(2)}`
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { addToast } = useToast()
  const courseId = Number(params?.id)

  if (!courseId) {
    notFound()
  }

  const { data: course, isLoading, error, refetch: refetchCourse } = usePublicCourse(courseId)
  const { data: allCourses = [] } = usePublicCourses()
  const coursePaymentIntentMutation = useCoursePaymentIntent()
  const { data: enrolledCourses = [] } = useEnrolledCourses()

  const [expandedSections, setExpandedSections] = useState<Array<number | string>>([])
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewedCourses, setReviewedCourses] = useState<Set<number>>(new Set())
  const [user, setUser] = useState<{ id: number; name: string; email: string; role?: string } | null>(null)

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
      // Get user from localStorage
      const storedUser = getStoredUser()
      setUser(storedUser)
    }
  }, [])

  // Listen for review submission events
  useEffect(() => {
    const handleReviewSubmitted = (event: Event) => {
      const customEvent = event as CustomEvent<{ courseId: number }>
      const courseId = customEvent.detail?.courseId
      if (courseId && courseId === Number(params?.id)) {
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
        // Refetch course data to get updated reviews
        refetchCourse()
      }
    }

    const handleAlreadyReviewed = (event: Event) => {
      const customEvent = event as CustomEvent<{ courseId: number }>
      const courseId = customEvent.detail?.courseId
      if (courseId && courseId === Number(params?.id)) {
        setReviewedCourses(prev => {
          const newSet = new Set(prev)
          newSet.add(courseId)
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
  }, [params?.id])

  // Check if current user has enrolled and paid for this course
  const isEnrolledAndPaid = useMemo(() => {
    if (!user || !course) return false
    const enrollment = enrolledCourses.find(
      (enrollment: any) => enrollment.course_id === course.id && enrollment.payment_status?.toLowerCase() === 'paid'
    )
    return !!enrollment
  }, [enrolledCourses, course, user])

  const toggleSection = (sectionId: number | string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleEnroll = async () => {
    if (!course) {
      addToast({
        type: 'error',
        title: 'Course Not Available',
        description: 'Course information is not available. Please try again.',
        duration: 5000,
      })
      return
    }

    try {
      const result = await coursePaymentIntentMutation.mutateAsync({
        course_id: course.id,
      })

      // Check if payment is required
      if (result?.requires_payment && result?.client_secret) {
        // Build URL with payment data as query parameters
        const paymentParams = new URLSearchParams({
          client_secret: result.client_secret,
          amount: String(result.amount),
          payment_intent: result.payment_intent_id || '',
        })
        
        // Add course info (URLSearchParams handles encoding automatically)
        const courseInfo = result.course || {
          id: course.id,
          title: course.title || 'Course',
          subject: getSubjectName(course),
          teacher: getTeacherName(course),
          price: Number(course.price) || 0,
          old_price: course.old_price ? Number(course.old_price) : undefined,
        }
        paymentParams.set('course', JSON.stringify(courseInfo))
        
        // Redirect to payment page with URL parameters
        router.push(`/payment?${paymentParams.toString()}`)
      } else {
        // No payment required, show success message
        addToast({
          type: 'success',
          title: 'Enrolled Successfully',
          description: result?.message || 'You have been enrolled in the course successfully!',
          duration: 5000,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in course. Please try again.'
      addToast({
        type: 'error',
        title: 'Enrollment Failed',
        description: errorMessage,
        duration: 6000,
      })
    }
  }

  const relatedCourses = useMemo(() => {
    if (!course) return []
    return allCourses
      .filter((item) => item.id !== course.id && (item.subject_id === course.subject_id || getSubjectName(item) === getSubjectName(course)))
      .slice(0, 3)
  }, [allCourses, course])

  // Get reviews from course data
  const reviews = course?.reviews || []
  
  // Check if current user has already reviewed this course
  const hasUserReviewed = useMemo(() => {
    if (!user || !course || !reviews.length) return false
    // Check if any review has the current user's ID as reviewer_id
    return reviews.some((review) => review.reviewer_id === user.id)
  }, [user, reviews, course])
  
  // Sync localStorage when we detect a review from API
  useEffect(() => {
    if (hasUserReviewed && course && !reviewedCourses.has(course.id) && typeof window !== 'undefined') {
      setReviewedCourses(prev => {
        const newSet = new Set(prev)
        newSet.add(course.id)
        try {
          localStorage.setItem('reviewed_courses', JSON.stringify(Array.from(newSet)))
        } catch (error) {
          console.error('Failed to save reviewed courses:', error)
        }
        return newSet
      })
    }
  }, [hasUserReviewed, course, reviewedCourses])
  
  // Also check localStorage as a fallback
  const isReviewedFromStorage = course ? reviewedCourses.has(course.id) : false
  
  // User has reviewed if they have a review in the API or in localStorage
  const isReviewed = hasUserReviewed || isReviewedFromStorage

  const formatReviewDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
      return `${Math.floor(diffDays / 365)} years ago`
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </div>
        <Footer />
      </>
    )
  }

  if (error || !course) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <XCircle className="h-16 w-16 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Unable to load course</h2>
          <p className="text-gray-400 max-w-md">
            {error instanceof Error ? error.message : 'The requested course could not be retrieved. Please try again later.'}
          </p>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
        <Footer />
      </>
    )
  }

  const modules = getModules(course)
  const subjectName = getSubjectName(course)
  const teacherName = getTeacherName(course)
  const priceLabel = getPriceLabel(course)
  const originalPrice = course.old_price ?? course.original_price
  const averageRating = course.average_rating ?? course.rating
  const studentsCount = course.students_count ?? course.total_students ?? 0
  const duration = course.duration ?? `${modules.length} modules`
  const language = course.language ?? 'English'
  const thumbnail = resolveThumbnailUrl(course.thumbnail_url, fallbackImage) || fallbackImage
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Header */}
              <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700">
                <div className="relative h-64 md:h-80">
                   <Image
                     src={thumbnail}
                    alt={course.title || 'Course thumbnail'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-gray-800/90 text-white border-gray-600">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-gray-800/90 text-white border-gray-600">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div> */}
                </div>
                
                <div className="p-6">
                  <div className="flex gap-2 mb-4">
                    <Badge className="bg-blue-500 text-white">{subjectName}</Badge>
                    {course.level && <Badge className="bg-green-500 text-white">{course.level}</Badge>}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {course.title || 'Untitled Course'}
                  </h1>
                  
                  <p className="text-gray-300 text-lg mb-6">
                    {course.description || 'No description provided for this course.'}
                  </p>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-semibold text-white">{averageRating ? averageRating.toFixed(1) : 'No rating'}</p>
                        <p className="text-sm text-gray-400">Rating</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-white">{studentsCount.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Students</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-white">{duration}</p>
                        <p className="text-sm text-gray-400">Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-semibold text-white">{language}</p>
                        <p className="text-sm text-gray-400">Language</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Instructor</h2>
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{teacherName}</h3>
                    {course.teacher?.email && (
                      <p className="text-sm text-gray-400 mb-1">{course.teacher.email}</p>
                    )}
                    <p className="text-gray-300">
                      {course.teacher?.bio || 'Experienced instructor ready to guide you through the course content.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Course Curriculum</h2>
                <div className="space-y-2">
                  {modules.length === 0 && (
                    <div className="text-center py-6 text-gray-400 border border-dashed border-gray-600 rounded-lg">
                      Curriculum details are not available yet.
                    </div>
                  )}
                  {modules.map((module: any, index: number) => {
                    const sectionId = module.id ?? module.order_index ?? index
                    const isExpanded = expandedSections.includes(sectionId)
                    const videos = getModuleVideos(module)
                    return (
                      <div key={sectionId} className="border border-gray-600 rounded-lg overflow-hidden">
                        {/* Section Header */}
                        <button
                          onClick={() => toggleSection(sectionId)}
                          className="w-full p-4 text-left hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{module.title || `Module ${index + 1}`}</h3>
                                <p className="text-sm text-gray-400">
                                  {videos.length} lessons{module.description ? ` • ${module.description}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">
                                {isExpanded ? 'Hide' : 'Show'} lessons
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>
                        
                        {/* Section Content */}
                        {isExpanded && (
                          <div className="border-t border-gray-600 bg-gray-700">
                            <div className="p-4 space-y-3">
                              {videos.length === 0 && (
                                <div className="text-sm text-gray-300">
                                  Lesson details will be added soon.
                                </div>
                              )}
                              {videos.map((lesson: any, lessonIndex: number) => {
                                const lessonType = lesson.type || 'video'
                                // Handle both video_url and video_path from API
                                const videoSource = lesson.video_url || lesson.video_path
                                const videoUrl = videoSource ? resolveMediaUrl(videoSource) : undefined
                                const durationLabel =
                                  lesson.duration_hours !== undefined && lesson.duration_hours !== null
                                    ? `${Number(lesson.duration_hours).toFixed(1)} hrs`
                                    : lesson.duration

                                return (
                                  <div
                                    key={lesson.id ?? lessonIndex}
                                    className="space-y-3 p-3 bg-gray-800 rounded-lg border border-gray-600"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-gray-600 text-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                                          {lessonIndex + 1}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {lessonType === 'video' && <Play className="w-4 h-4 text-blue-500" />}
                                          {lessonType === 'quiz' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                          {lessonType === 'exercise' && <Award className="w-4 h-4 text-purple-500" />}
                                          {lessonType === 'discussion' && <Users className="w-4 h-4 text-orange-500" />}
                                          <span className="text-sm font-medium text-white">
                                            {lesson.title || `Lesson ${lessonIndex + 1}`}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {lessonType && (
                                          <span className="text-xs text-gray-300 bg-gray-600 px-2 py-1 rounded capitalize">
                                            {lessonType.replace(/_/g, ' ')}
                                          </span>
                                        )}
                                        {durationLabel && (
                                          <span className="text-sm text-gray-400">
                                            {durationLabel}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {lesson.description && (
                                      <p className="text-xs text-gray-400 leading-relaxed">
                                        {lesson.description}
                                      </p>
                                    )}
                                    {videoUrl ? (
                                      <div className="rounded-lg overflow-hidden border border-gray-700 bg-black">
                                        <div
                                          className="relative w-full"
                                          style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
                                        >
                                          <video
                                            controls
                                            className="absolute inset-0 h-full w-full object-cover"
                                            preload="metadata"
                                          >
                                            <source src={videoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                          </video>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-500 italic">
                                        Video not available for this lesson.
                                      </p>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Student Reviews</h2>
                  {isEnrolledAndPaid && (
                    !isReviewed ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewModalOpen(true)}
                        className="border-purple-600 text-purple-400 hover:bg-purple-900/30"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Write a Review
                      </Button>
                    ) : (
                      <Badge className="bg-green-600/80 text-white flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        Reviewed
                      </Badge>
                    )
                  )}
                </div>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No reviews yet. Be the first to review this course!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-600 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {review.reviewer?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{review.reviewer?.name || 'Anonymous'}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-600 fill-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-400">{formatReviewDate(review.created_at)}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* Pricing Card */}
                <Card className="mb-6 bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold text-white">{priceLabel}</span>
                        {originalPrice && Number(originalPrice) > Number(course.price) && (
                          <span className="text-lg text-gray-400 line-through">${Number(originalPrice).toFixed(2)}</span>
                        )}
                      </div>
                      {originalPrice && Number(originalPrice) > Number(course.price) && (
                        <Badge className="bg-green-500 text-white">
                          Save ${(Number(originalPrice) - Number(course.price)).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleEnroll}
                      disabled={!course || coursePaymentIntentMutation.isPending}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {coursePaymentIntentMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Enroll Now'
                      )}
                    </Button>
                    
                    <div className="space-y-3 text-sm">
                      {(course.features ?? [
                        'Lifetime access',
                        'Certificate of completion',
                        'Community support'
                      ]).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Info */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white mb-4">Course Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Updated</span>
                        <span className="text-white">{course.updated_at ? new Date(course.updated_at).toLocaleDateString() : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Category</span>
                        <span className="text-white">{subjectName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Level</span>
                        <span className="text-white">{course.level || 'All levels'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Language</span>
                        <span className="text-white">{language}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-white mb-8">Related Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCourses.map((relatedCourse) => (
                  <div key={relatedCourse.id} className="bg-gray-800 border border-gray-700 rounded-lg p-5 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white line-clamp-2">
                        {relatedCourse.title || 'Untitled Course'}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-3">
                        {relatedCourse.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{getSubjectName(relatedCourse)}</span>
                      <span>{getPriceLabel(relatedCourse)}</span>
                    </div>
                    <Button asChild variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-700 cursor-pointer w-full">
                      <Link href={`/courses/${relatedCourse.id}`}>View Course</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Review Modal */}
      {course && (
        <CourseReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          courseId={course.id}
          courseTitle={course.title}
        />
      )}
    </>
  )
}
