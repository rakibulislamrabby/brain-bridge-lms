import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '../ui/card'
import { Play, Clock, Users, Star } from 'lucide-react'

interface Course {
  id: number
  course_title: string
  description: string
  image: string
  price: number
  original_price: number
  ratings: number
  total_ratings: number
  students_enrolled: number
  instructor: {
    name: string
    avatar: string
    rating: number
    students: number
  }
  duration: string
  level: string
  language: string
  last_updated: string
  category: string
  tags: string[]
  features: string[]
}

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const formatStudents = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatRatings = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        {/* Course Image */}
        <div className="relative">
          <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
            <Image
              src={course.image}
              alt={course.course_title}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Instructor Avatar */}
          <div className="absolute bottom-0 right-4 translate-y-1/2">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white">
              <Image
                src={course.instructor.avatar}
                alt={course.instructor.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Tags */}
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md flex items-center gap-1">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
              {course.category}
            </span>
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-md flex items-center gap-1">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
              {course.level}
            </span>
          </div>

          {/* Course Title */}
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
            {course.course_title}
          </h3>

          {/* Course Metrics */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Play className="w-4 h-4" />
              <span>20</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{formatStudents(course.students_enrolled)}</span>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-gray-300"></div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">${course.price}</span>
              {course.original_price > course.price && (
                <span className="text-sm text-gray-500 line-through">${course.original_price}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{course.ratings}</span>
              <span className="text-sm text-gray-500">({formatRatings(course.total_ratings)})</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
