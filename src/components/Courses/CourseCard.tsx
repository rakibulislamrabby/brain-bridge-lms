'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card } from '../ui/card'
import { Layers, Video, Calendar as CalendarIcon, BookOpen, DollarSign, Star } from 'lucide-react'

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
const FALLBACK_COURSE_IMAGE = `${MEDIA_BASE_URL}storage/thumbnails/1762758606_69118fce0e74a.jpg`

interface CourseCardProps {
  course: Record<string, any>
  onClick?: (course: Record<string, any>) => void
}

const formatStudents = (value?: number | string | null) => {
  if (value === undefined || value === null) {
    return '0'
  }
  const num = Number(value)
  if (Number.isNaN(num)) {
    return '0'
  }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

const formatRatings = (value?: number | string | null) => {
  if (value === undefined || value === null) {
    return '0'
  }
  const num = Number(value)
  if (Number.isNaN(num)) {
    return '0'
  }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

const resolveMediaUrl = (path?: string | null, fallback?: string) => {
  if (!path || typeof path !== 'string') {
    return fallback
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  if (!MEDIA_BASE_URL) {
    return fallback
  }

  const base = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`
  const cleanedPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '')
  return `${base}storage/${cleanedPath}`
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const router = useRouter()
  const courseTitle = course.title || course.course_title || 'Untitled Course'
  const subjectName = course.subject?.name || course.subject_name || 'General'
  const teacherName = course.teacher?.name || course.teacher_name || 'Unknown Instructor'
  const courseImage = resolveMediaUrl(course.thumbnail_url || course.image, FALLBACK_COURSE_IMAGE) || FALLBACK_COURSE_IMAGE
  const instructorAvatar = resolveMediaUrl(course.teacher?.profile_picture || course.instructor?.avatar)

  const modules = Array.isArray(course.modules) ? course.modules : []
  const modulesCount = modules.length
  const videosCount = modules.reduce((total: number, module: any) => {
    const lessons = Array.isArray(module.video_lessons) ? module.video_lessons : module.videos
    if (Array.isArray(lessons)) {
      return total + lessons.length
    }
    return total
  }, 0)

  const createdAt = course.created_at ? new Date(course.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : '—'

  const priceValue = Number(course.price ?? 0)
  const oldPriceValue = Number(course.old_price ?? course.original_price ?? 0)

  const handleClick = () => {
    if (onClick) {
      onClick(course)
    } else {
      // Fallback: navigate to course page if no onClick handler provided
      router.push(`/courses/${course.id}`)
    }
  }

  return (
    <Card 
      onClick={handleClick}
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gray-800 border-gray-700"
    >
        {/* Course Image */}
        <div className="relative">
          <div className="w-full h-48 bg-gray-700 relative overflow-hidden">
            <Image
              src={courseImage}
              alt={course.course_title || 'Course image'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          
          {/* Instructor Avatar */}
          {instructorAvatar && (
          <div className="absolute bottom-0 right-4 translate-y-1/2">
            <div className="w-12 h-12 rounded-full border-2 border-gray-800 overflow-hidden bg-gray-800">
              <Image
                  src={instructorAvatar}
                  alt={course.instructor?.name || 'Instructor'}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                  unoptimized
              />
            </div>
          </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md flex items-center gap-1">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
              {subjectName}
            </span>
          </div>

          {/* Course Title */}
          <h3 className="font-bold text-lg text-white line-clamp-2">
            {courseTitle}
          </h3>

          {/* Course Metrics */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Layers className="w-4 h-4 text-orange-400" />
              <span>{modulesCount} modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="w-4 h-4 text-blue-400" />
              <span>{videosCount} videos</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              <span>{createdAt}</span>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-gray-600"></div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                ${priceValue.toFixed(2)}
              </span>
              {oldPriceValue > priceValue && (
                <span className="text-sm text-gray-400 line-through">${oldPriceValue.toFixed(2)}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-gray-300">{teacherName}</span>
            </div>
          </div>
        </div>
      </Card>
  )
}
