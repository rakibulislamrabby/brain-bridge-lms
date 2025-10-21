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
    <section className="pt-20 pb-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Laptop className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Popular Courses</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Pick A Course To Get Started</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform is built on the principles of innovation, quality, and inclusivity, aiming to provide a seamless learning
          </p>
        </div>

        {/* Featured Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* View All Courses Button */}
        <div className="text-center">
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
