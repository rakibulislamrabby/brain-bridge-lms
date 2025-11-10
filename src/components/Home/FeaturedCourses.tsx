'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Laptop,
  Loader2,
  XCircle,
  BookOpen,
  Layers,
  Film,
  Star
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { useCourses } from '@/hooks/course/use-courses'

const getSubjectName = (course: any) => {
  return course.subject?.name || course.subject_name || 'General'
}

const getTeacherName = (course: any) => {
  return course.teacher?.name || course.teacher_name || 'Unknown Instructor'
}

const getModulesCount = (course: any) => {
  if (typeof course.modules_count === 'number') {
    return course.modules_count
  }
  if (Array.isArray(course.modules)) {
    return course.modules.length
  }
  return 0
}

const getVideosCount = (course: any) => {
  if (typeof course.videos_count === 'number') {
    return course.videos_count
  }
  if (Array.isArray(course.videos)) {
    return course.videos.length
  }
  return 0
}

const getAverageRating = (course: any) => {
  return course.average_rating ?? course.rating ?? null
}

const getPriceLabel = (course: any) => {
  if (course.price === undefined || course.price === null || course.price === '') {
    return '—'
  }

  const priceNumber = Number(course.price)
  if (!Number.isNaN(priceNumber)) {
    return `$${priceNumber.toFixed(2)}`
  }

  return String(course.price)
}

export default function FeaturedCourses() {
  const { data: courses = [], isLoading, error } = useCourses()

  const featuredCourses = useMemo(() => courses.slice(0, 6), [courses])

  return (
    <section className="pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 bg-gray-800 -mt-6 sm:-mt-8 lg:-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 font-hubot">
            <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="text-purple-400 font-medium text-sm sm:text-base">Popular Courses</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 font-hubot">Pick A Course To Get Started</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4 font-hubot">
            Discover the latest courses curated by Brain Bridge. Browse a snapshot of what&apos;s new below, or explore the full catalogue on the courses page.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Failed to load courses</h3>
            <p className="text-gray-400 text-center max-w-md">
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </div>
        ) : featuredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <BookOpen className="h-12 w-12 text-gray-500" />
            <h3 className="text-xl font-semibold text-white">No courses available yet</h3>
            <p className="text-gray-400 text-center max-w-md">
              Check back soon—new courses are being added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10">
            {featuredCourses.map((course) => {
              const subjectName = getSubjectName(course)
              const teacherName = getTeacherName(course)
              const modulesCount = getModulesCount(course)
              const videosCount = getVideosCount(course)
              const averageRating = getAverageRating(course)
              const priceLabel = getPriceLabel(course)

              return (
                <Card key={course.id} className="bg-gray-900 border-gray-700 flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-white text-lg line-clamp-2 pt-5">
                      {course.title || 'Untitled Course'}
                    </CardTitle>
                    <p className="text-xs uppercase tracking-wide text-gray-400">{subjectName}</p>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-gray-400">
                    <p className="line-clamp-3">
                      {course.description || 'No description provided for this course.'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-300">{modulesCount} modules</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Film className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-300">{videosCount} videos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-300">
                          {averageRating ? averageRating.toFixed(1) : 'No rating yet'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <span className="text-gray-300">{teacherName}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-white">{priceLabel}</span>
                    <Button asChild variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-700 cursor-pointer">
                      <Link href={`/courses/${course.id}`}>View Course</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {/* View All Courses Button */}
        <div className="text-center">
          <Button asChild className="bg-purple-600 hover:bg-purple-700 py-3 sm:py-4 lg:py-6 text-white px-6 sm:px-8 text-sm sm:text-base lg:text-lg">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
