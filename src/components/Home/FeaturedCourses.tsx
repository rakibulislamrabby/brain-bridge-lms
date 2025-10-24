'use client'

import React from 'react'
import CourseCard from '../Courses/CourseCard'
import coursesData from '../../data/courses.json'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Laptop } from 'lucide-react'

export default function FeaturedCourses() {
  // Get first 6 courses for home page
  const featuredCourses = coursesData.courses.slice(0, 6)

  return (
    <section className="pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 bg-gray-50 -mt-6 sm:-mt-8 lg:-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-blue-600 font-medium text-sm sm:text-base">Popular Courses</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Pick A Course To Get Started</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Our platform is built on the principles of innovation, quality, and inclusivity, aiming to provide a seamless learning
          </p>
        </div>

        {/* Featured Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* View All Courses Button */}
        <div className="text-center">
          <Button asChild className="bg-orange-600 hover:bg-orange-700 py-3 sm:py-4 lg:py-6 text-white px-6 sm:px-8 text-sm sm:text-base lg:text-lg">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
