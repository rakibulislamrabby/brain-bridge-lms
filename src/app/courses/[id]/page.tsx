'use client'

import React, { useMemo, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Footer from '@/components/shared/Footer'
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
import { useCourse, useCourses } from '@/hooks/course/use-courses'
import { Loader2, XCircle } from 'lucide-react'

const fallbackImage = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80'

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
  const courseId = Number(params?.id)

  if (!courseId) {
    notFound()
  }

  const { data: course, isLoading, error } = useCourse(courseId)
  const { data: allCourses = [] } = useCourses()

  const [expandedSections, setExpandedSections] = useState<Array<number | string>>([])

  const toggleSection = (sectionId: number | string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const relatedCourses = useMemo(() => {
    if (!course) return []
    return allCourses
      .filter((item) => item.id !== course.id && (item.subject_id === course.subject_id || getSubjectName(item) === getSubjectName(course)))
      .slice(0, 3)
  }, [allCourses, course])

  // Mock reviews data (placeholder until API provides reviews)
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      date: "2 weeks ago",
      comment: "Excellent course! The instructor explains everything clearly and the practical exercises are very helpful."
    },
    {
      id: 2,
      name: "Mike Chen",
      rating: 5,
      date: "1 month ago",
      comment: "Great content and well-structured. I learned a lot and would definitely recommend this course."
    },
    {
      id: 3,
      name: "Emily Davis",
      rating: 4,
      date: "3 weeks ago",
      comment: "Very informative course with good examples. The instructor is knowledgeable and engaging."
    }
  ]

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
  const thumbnail = course.thumbnail_url || fallbackImage

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
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
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-gray-800/90 text-white border-gray-600">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-gray-800/90 text-white border-gray-600">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
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
                              {videos.map((lesson: any, lessonIndex: number) => (
                                <div key={lesson.id ?? lessonIndex} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-600">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-gray-600 text-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                                      {lessonIndex + 1}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {lesson.type === 'video' && <Play className="w-4 h-4 text-blue-500" />}
                                      {lesson.type === 'quiz' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                      {lesson.type === 'exercise' && <Award className="w-4 h-4 text-purple-500" />}
                                      {lesson.type === 'discussion' && <Users className="w-4 h-4 text-orange-500" />}
                                      <span className="text-sm font-medium text-white">{lesson.title || `Lesson ${lessonIndex + 1}`}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {lesson.type && (
                                      <span className="text-xs text-gray-300 bg-gray-600 px-2 py-1 rounded">
                                        {lesson.type}
                                      </span>
                                    )}
                                    {lesson.duration_hours && (
                                      <span className="text-sm text-gray-400">
                                        {Number(lesson.duration_hours).toFixed(1)} hrs
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Student Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-600 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                          <div>
                            <p className="font-semibold text-white">{review.name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{review.date}</span>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
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
                    
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 mb-4">
                      Enroll Now
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
    </>
  )
}
