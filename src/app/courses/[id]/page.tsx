import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Footer from '@/components/shared/Footer'
import CourseCard from '@/components/Courses/CourseCard'
import coursesData from '../../../data/courses.json'
import { 
  Star, 
  Clock, 
  Users, 
  Play, 
  CheckCircle, 
  Award, 
  Globe, 
  Calendar,
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react'

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

  // Get related courses (same category, excluding current course)
  const relatedCourses = coursesData.courses
    .filter(c => c.category === course.category && c.id !== course.id)
    .slice(0, 3)

  // Mock curriculum data
  const curriculum = [
    { id: 1, title: "Introduction to the Course", duration: "15 min", lessons: 3 },
    { id: 2, title: "Getting Started", duration: "45 min", lessons: 5 },
    { id: 3, title: "Core Concepts", duration: "2 hours", lessons: 8 },
    { id: 4, title: "Advanced Topics", duration: "1.5 hours", lessons: 6 },
    { id: 5, title: "Practical Applications", duration: "1 hour", lessons: 4 },
    { id: 6, title: "Final Project", duration: "30 min", lessons: 2 }
  ]

  // Mock reviews data
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

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/courses" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Header */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative h-64 md:h-80">
                  <Image
                    src={course.image}
                    alt={course.course_title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-white/90">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/90">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex gap-2 mb-4">
                    <Badge className="bg-blue-500 text-white">{course.category}</Badge>
                    <Badge className="bg-green-500 text-white">{course.level}</Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {course.course_title}
                  </h1>
                  
                  <p className="text-gray-600 text-lg mb-6">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-semibold">{course.ratings}</p>
                        <p className="text-sm text-gray-500">Rating</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold">{course.students_enrolled.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Students</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-semibold">{course.duration}</p>
                        <p className="text-sm text-gray-500">Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-semibold">{course.language}</p>
                        <p className="text-sm text-gray-500">Language</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h2>
                <div className="flex items-center gap-4">
                  <Image
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{course.instructor.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{course.instructor.rating}</span>
                      <span className="text-gray-500">({course.instructor.students.toLocaleString()} students)</span>
                    </div>
                    <p className="text-gray-600">Expert instructor with years of experience in {course.category.toLowerCase()}.</p>
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
                <div className="space-y-3">
                  {curriculum.map((section, index) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{section.title}</h3>
                            <p className="text-sm text-gray-500">{section.lessons} lessons • {section.duration}</p>
                          </div>
                        </div>
                        <Play className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* Pricing Card */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold text-gray-900">${course.price}</span>
                        {course.original_price > course.price && (
                          <span className="text-lg text-gray-500 line-through">${course.original_price}</span>
                        )}
                      </div>
                      {course.original_price > course.price && (
                        <Badge className="bg-green-500 text-white">
                          Save ${(course.original_price - course.price).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 mb-4">
                      Enroll Now
                    </Button>
                    
                    <div className="space-y-3 text-sm">
                      {course.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Course Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated</span>
                        <span className="text-gray-900">{new Date(course.last_updated).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category</span>
                        <span className="text-gray-900">{course.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Level</span>
                        <span className="text-gray-900">{course.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Language</span>
                        <span className="text-gray-900">{course.language}</span>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCourses.map((relatedCourse) => (
                  <CourseCard key={relatedCourse.id} course={relatedCourse} />
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
