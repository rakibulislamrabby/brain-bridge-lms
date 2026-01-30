'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Clock, 
  Users, 
  Globe,
  Play,
  Award,
  CheckCircle,
  User
} from 'lucide-react'

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL

const resolveMediaUrl = (path?: string | null, fallback?: string) => {
  if (!path) {
    return fallback
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  if (!MEDIA_BASE_URL) {
    return fallback
  }

  const base = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`
  
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

  if (!MEDIA_BASE_URL) {
    return fallback
  }

  const base = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`
  const cleanedPath = path
    .replace(/^\/?storage\/thumbnails\//, '')
    .replace(/^\/?thumbnails\//, '')
    .replace(/^\/?storage\//, '')
    .replace(/^\/+/, '')
  return `${base}storage/thumbnails/${cleanedPath}`
}

interface CoursePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: any
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

const getFirstVideo = (course: any) => {
  const modules = getModules(course)
  for (const module of modules) {
    const videos = getModuleVideos(module)
    if (videos.length > 0) {
      const firstVideo = videos[0]
      const videoSource = firstVideo.video_url || firstVideo.video_path
      return {
        ...firstVideo,
        videoUrl: videoSource ? resolveMediaUrl(videoSource) : undefined,
        moduleTitle: module.title || 'Module 1'
      }
    }
  }
  return null
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

export default function CoursePreviewModal({
  open,
  onOpenChange,
  course
}: CoursePreviewModalProps) {
  if (!course) return null

  const firstVideo = getFirstVideo(course)
  const subjectName = getSubjectName(course)
  const teacherName = getTeacherName(course)
  const priceLabel = getPriceLabel(course)
  const originalPrice = course.old_price ?? course.original_price
  const averageRating = course.average_rating ?? course.rating
  const studentsCount = course.students_count ?? course.total_students ?? 0
  const duration = course.duration ?? `${getModules(course).length} modules`
  const language = course.language ?? 'English'
  const thumbnail = resolveThumbnailUrl(course.thumbnail_url)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[95vw] sm:!w-[90vw] lg:!w-[85vw] !max-w-[1200px] max-h-[90vh] bg-gray-900 border-gray-700 p-0 overflow-hidden"
        style={{ 
          width: '95vw', 
          maxWidth: '1200px',
        }}
      >
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-hidden">
          {/* Left Side - Video Player */}
          <div className="lg:w-2/3 bg-gray-900 p-3 sm:p-4 lg:p-6 flex flex-col overflow-y-auto overflow-x-hidden pb-4 sm:pb-6 custom-scrollbar">
            {/* Video Player Section */}
            {firstVideo && firstVideo.videoUrl ? (
              <div className="mb-3">
                <div className="relative w-full sm:w-[80%] mx-auto rounded-lg overflow-hidden border border-gray-700 bg-black shadow-2xl">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
                  >
                    <video
                      controls
                      className="absolute inset-0 h-full w-full object-cover"
                      preload="metadata"
                      poster={thumbnail}
                    >
                      <source src={firstVideo.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <Play className="w-3 h-3" />
                  <span>Preview: {firstVideo.title || 'First Lesson'}</span>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <div className="relative w-full sm:w-[80%] mx-auto rounded-lg overflow-hidden border border-gray-700 bg-gray-800 shadow-2xl">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: '56.25%' }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Video preview not available</p>
                      </div>
                    </div>
                    <Image
                      src={thumbnail}
                      alt={course.title || 'Course thumbnail'}
                      fill
                      className="object-cover opacity-50"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            )}
            
            <DialogHeader className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500 text-white text-xs">{subjectName}</Badge>
                {course.level && <Badge className="bg-green-500 text-white text-xs">{course.level}</Badge>}
              </div>
              <DialogTitle className="text-xl lg:text-2xl font-bold text-white text-left line-clamp-2">
                {course.title || 'Untitled Course'}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-left mt-1 text-sm line-clamp-2">
                {course.description || 'No description provided for this course.'}
              </DialogDescription>
            </DialogHeader>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 sm:mb-0">
              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-xs">{averageRating ? averageRating.toFixed(1) : 'No rating'}</p>
                  <p className="text-[10px] text-gray-400">Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-xs">{studentsCount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                <Clock className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-xs">{duration}</p>
                  <p className="text-[10px] text-gray-400">Duration</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-xs">{language}</p>
                  <p className="text-[10px] text-gray-400">Language</p>
                </div>
              </div>
            </div>

            {/* Course Features */}
            {/* <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                What You'll Learn
              </h3>
              <div className="space-y-2">
                {(course.features ?? [
                  'Lifetime access',
                  'Certificate of completion',
                  'Community support'
                ]).map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Right Side - Teacher & Course Info */}
          <div className="lg:w-1/3 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 p-3 sm:p-4 lg:p-6 pb-6 sm:pb-8 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Pricing */}
            <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-700 flex-shrink-0">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-white">{priceLabel}</span>
                  {originalPrice && Number(originalPrice) > Number(course.price) && (
                    <span className="text-sm text-gray-400 line-through">${Number(originalPrice).toFixed(2)}</span>
                  )}
                </div>
                {originalPrice && Number(originalPrice) > Number(course.price) && (
                  <Badge className="bg-green-500 text-white text-xs">
                    Save ${(Number(originalPrice) - Number(course.price)).toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Teacher Section */}
            <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                Instructor
              </h3>
              <div className="space-y-2">
                <div>
                  <h4 className="text-base font-semibold text-white mb-0.5">{teacherName}</h4>
                  {course.teacher?.email && (
                    <p className="text-xs text-gray-400 mb-1">{course.teacher.email}</p>
                  )}
                  <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                    {course.teacher?.bio || 'Experienced instructor ready to guide you through the course content.'}
                  </p>
                </div>
                {course.teacher_id && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full border-orange-600 text-orange-400 hover:bg-orange-900/30 text-xs py-1 h-7"
                  >
                    <Link href={`/masters/${course.teacher_id}`}>
                      View Full Profile
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Course Details */}
            <div className="mb-2 sm:mb-3 flex-shrink-0">
              <h3 className="text-sm font-semibold text-white mb-2">Course Details</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white font-medium">
                    {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white font-medium">{subjectName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                  <span className="text-gray-400">Level</span>
                  <span className="text-white font-medium">{course.level || 'All levels'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-400">Language</span>
                  <span className="text-white font-medium">{language}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              asChild
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 sm:py-2 text-sm font-semibold mt-auto"
              onClick={() => onOpenChange(false)}
            >
              <Link href={`/courses/${course.id}`}>
                View Full Course
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

