'use client'

import React from 'react'
import CourseCard from '../Courses/CourseCard'
import coursesData from '../../data/courses.json'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Laptop, MapPin, Video, Monitor } from 'lucide-react'

export default function FeaturedCourses() {
  // Get courses by delivery method
  const inPersonCourses = coursesData.courses.filter(course => course.delivery_method === 'in_person').slice(0, 3)
  const videoCallCourses = coursesData.courses.filter(course => course.delivery_method === 'video_call').slice(0, 3)
  const onlineCourses = coursesData.courses.filter(course => course.delivery_method === 'online').slice(0, 3)

  const deliverySections = [
    {
      id: 'in_person',
      title: 'In-Person Lessons',
      description: 'Learn face-to-face with experienced masters in a personalized setting',
      icon: MapPin,
      color: 'orange',
      courses: inPersonCourses,
      bgGradient: 'from-orange-900/20 to-transparent'
    },
    {
      id: 'video_call',
      title: 'Video Call Sessions',
      description: 'Interactive one-on-one sessions via video calls from anywhere',
      icon: Video,
      color: 'purple',
      courses: videoCallCourses,
      bgGradient: 'from-purple-900/20 to-transparent'
    },
    {
      id: 'online',
      title: 'Online-Only Courses',
      description: 'Self-paced online courses with lifetime access and certificates',
      icon: Monitor,
      color: 'blue',
      courses: onlineCourses,
      bgGradient: 'from-blue-900/20 to-transparent'
    }
  ]

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
            Our platform is built on the principles of innovation, quality, and inclusivity, offering flexible learning options to suit your needs
          </p>
        </div>

        {/* Delivery Method Sections */}
        <div className="space-y-12 sm:space-y-16 mb-8 sm:mb-12">
          {deliverySections.map((section) => {
            const Icon = section.icon
            const colorClasses = {
              orange: {
                icon: 'text-orange-400',
                border: 'border-orange-500/30',
                button: 'bg-orange-600 hover:bg-orange-700',
                badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
              },
              purple: {
                icon: 'text-purple-400',
                border: 'border-purple-500/30',
                button: 'bg-purple-600 hover:bg-purple-700',
                badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              },
              blue: {
                icon: 'text-blue-400',
                border: 'border-blue-500/30',
                button: 'bg-blue-600 hover:bg-blue-700',
                badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }
            }
            const colors = colorClasses[section.color as keyof typeof colorClasses]

            return (
              <div key={section.id} className={`relative rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${section.bgGradient} border ${colors.border}`}>
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-3 rounded-lg bg-gray-800 ${colors.border} border`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.icon}`} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 font-hubot">
                        {section.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-400">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-sm font-medium ${colors.badge}`}>
                    {section.courses.length} Courses Available
                  </div>
                </div>

                {/* Course Grid */}
                {section.courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6">
                    {section.courses.map((course) => (
                      <CourseCard key={course.id} course={course as any} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No courses available in this category yet.</p>
                  </div>
                )}

                {/* View More Button */}
                {section.courses.length > 0 && (
                  <div className="text-center">
                    <Button 
                      asChild 
                      className={`${colors.button} text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base`}
                    >
                      <Link href={`/courses?delivery=${section.id}`}>
                        View All {section.title}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

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
