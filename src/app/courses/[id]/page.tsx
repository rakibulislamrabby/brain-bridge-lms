import React from 'react'
import { notFound } from 'next/navigation'
import coursesData from '../../../public/data/courses.json'

interface CourseDetailPageProps {
  params: {
    id: string
  }
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = coursesData.courses.find(c => c.id === parseInt(params.id))
  
  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Course Image */}
            <div className="md:w-1/2">
              <div className="h-64 md:h-full bg-gray-200 relative">
                <img
                  src={course.image}
                  alt={course.course_title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Course Details */}
            <div className="md:w-1/2 p-8">
              <div className="space-y-6">
                {/* Tags */}
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                    {course.level}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900">
                  {course.course_title}
                </h1>

                {/* Description */}
                <p className="text-gray-600 text-lg">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-3">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{course.instructor.name}</p>
                    <p className="text-sm text-gray-500">Instructor</p>
                  </div>
                </div>

                {/* Course Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{course.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Language</p>
                    <p className="font-medium">{course.language}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Students</p>
                    <p className="font-medium">{course.students_enrolled.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-medium">{course.ratings} ({course.total_ratings})</p>
                  </div>
                </div>

                {/* Price and Enroll Button */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                      {course.original_price > course.price && (
                        <span className="text-lg text-gray-500 line-through ml-2">${course.original_price}</span>
                      )}
                    </div>
                  </div>
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
