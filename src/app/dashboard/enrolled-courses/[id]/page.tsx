'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { notFound, useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Play, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight, 
  ArrowLeft,
  Video,
  BookOpen,
  Clock,
  Award
} from 'lucide-react'
import { usePublicCourse } from '@/hooks/course/public/use-public-courses'
import { useEnrolledCourses } from '@/hooks/student/use-enrolled-courses'
import { Loader2, XCircle } from 'lucide-react'
import { getStoredUser } from '@/hooks/useAuth'

const MEDIA_BASE_URL = 'https://brainbridge.mitwebsolutions.com/'

const resolveMediaUrl = (path?: string | null) => {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  const base = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`
  
  if (path.startsWith('videos/') || path.startsWith('/videos/')) {
    const cleanedPath = path.replace(/^\/?videos\//, '').replace(/^\/+/, '')
    return `${base}storage/videos/${cleanedPath}`
  }
  
  const cleanedPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '')
  return `${base}storage/${cleanedPath}`
}

export default function EnrolledCourseViewerPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const courseId = Number(params?.id)

  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())

  const { data: course, isLoading: courseLoading, error: courseError } = usePublicCourse(courseId)
  const { data: enrolledCourses = [], isLoading: enrollmentsLoading } = useEnrolledCourses()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/signin')
      return
    }
    setUser(storedUser)
  }, [router])

  // Verify enrollment
  const enrollment = useMemo(() => {
    if (!user || !courseId) return null
    return enrolledCourses.find(
      (e: any) => e.course_id === courseId && e.payment_status?.toLowerCase() === 'paid'
    )
  }, [enrolledCourses, courseId, user])

  const modules = useMemo(() => {
    if (!course?.modules) return []
    return Array.isArray(course.modules) ? course.modules : []
  }, [course])

  // Set initial active lesson and expand first module
  useEffect(() => {
    if (modules.length > 0 && !activeLesson) {
      const firstModule = modules[0]
      const lessons = firstModule.video_lessons || firstModule.videos || []
      if (lessons.length > 0) {
        setActiveLesson(lessons[0])
        setExpandedModules(new Set([firstModule.id || 0]))
      }
    }
  }, [modules, activeLesson])

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  if (courseLoading || enrollmentsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (courseError || !course) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  if (!enrollment) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 max-w-md mb-6">
            You are not enrolled in this course or your payment is still pending.
          </p>
          <Button onClick={() => router.push('/dashboard/enrolled-courses')} variant="orange">
            Go to My Courses
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const videoUrl = activeLesson ? resolveMediaUrl(activeLesson.video_url || activeLesson.video_path) : undefined

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-900 -m-6"> {/* Negative margin to bleed into dashboard layout if needed */}
        {/* Course Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/dashboard/enrolled-courses')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-bold text-white line-clamp-1">{course.title}</h1>
                <p className="text-xs text-gray-400">Instructor: {course.teacher?.name || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all" 
                    style={{ width: `${enrollment.progress_percentage || 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-medium">{enrollment.progress_percentage || 0}% Complete</span>
              </div>
              <Button size="sm" variant="outline" className="border-orange-600 text-orange-500 hover:bg-orange-500/10">
                <Award className="h-4 w-4 mr-2" />
                Certificate
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main Content: Video Player */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Video Player Wrapper */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                {videoUrl ? (
                  <video 
                    key={activeLesson?.id}
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Video className="h-16 w-16 mb-4 opacity-20" />
                    <p>Select a lesson to start watching</p>
                  </div>
                )}
              </div>

              {/* Lesson Details */}
              {activeLesson && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
                    {activeLesson.duration && (
                      <span className="flex items-center text-sm text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {activeLesson.duration}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-invert max-w-none text-gray-300">
                    <p>{activeLesson.description || 'No description available for this lesson.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Course Content */}
          <div className="w-full lg:w-96 bg-gray-800/50 border-l border-gray-700 overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                Course Content
              </h3>
            </div>
            
            <div className="divide-y divide-gray-700/50">
              {modules.map((module: any, index: number) => {
                const isExpanded = expandedModules.has(module.id || 0)
                const lessons = module.video_lessons || module.videos || []
                
                return (
                  <div key={module.id || index} className="bg-transparent">
                    <button
                      onClick={() => toggleModule(module.id || 0)}
                      className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 group-hover:text-orange-500 transition-colors">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="text-left">
                          <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                            {module.title}
                          </h4>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                            {lessons.length} Lessons
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-900/30">
                        {lessons.length === 0 ? (
                          <div className="px-11 py-3 text-xs text-gray-500 italic">
                            No lessons available.
                          </div>
                        ) : (
                          lessons.map((lesson: any, lIndex: number) => {
                            const isActive = activeLesson?.id === lesson.id
                            return (
                              <button
                                key={lesson.id || lIndex}
                                onClick={() => setActiveLesson(lesson)}
                                className={`w-full px-4 py-3 flex items-center gap-3 transition-all border-l-2 ${
                                  isActive 
                                    ? 'bg-orange-500/10 border-orange-500' 
                                    : 'border-transparent hover:bg-gray-700/30'
                                }`}
                              >
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                  isActive ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
                                }`}>
                                  <Play className="h-3 w-3 fill-current" />
                                </div>
                                <div className="flex-1 text-left">
                                  <p className={`text-sm ${isActive ? 'text-white font-medium' : 'text-gray-400'}`}>
                                    {lesson.title}
                                  </p>
                                  {lesson.duration && (
                                    <span className="text-[10px] text-gray-500 font-mono">
                                      {lesson.duration}
                                    </span>
                                  )}
                                </div>
                                {isActive && (
                                  <CheckCircle className="h-3 w-3 text-orange-500" />
                                )}
                              </button>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </DashboardLayout>
  )
}

