'use client'

import React, { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '../ui/button'

interface Review {
  id: number
  name: string
  avatar: string
  rating: number
  course: string
  comment: string
  date: string
}

export default function StudentReview() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const reviews: Review[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/images/avatars/sarah.jpg",
      rating: 5,
      course: "Complete Web Development Bootcamp",
      comment: "This course completely transformed my understanding of web development. The instructor explains complex concepts in such a clear and engaging way. The hands-on projects really helped me build confidence. I went from knowing nothing to building my own websites!",
      date: "2 weeks ago"
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "/images/avatars/michael.jpg",
      rating: 5,
      course: "Advanced Python Programming",
      comment: "Exceptional course! The instructor's expertise really shows through every lesson. The practical examples and real-world applications made learning Python so much more interesting. I've already started using these skills in my job.",
      date: "1 month ago"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "/images/avatars/emily.jpg",
      rating: 5,
      course: "Digital Marketing Mastery",
      comment: "Amazing course with incredible value! The instructor breaks down complex marketing strategies into digestible lessons. The case studies and practical exercises were game-changers for my business. Highly recommend!",
      date: "3 weeks ago"
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "/images/avatars/david.jpg",
      rating: 5,
      course: "UI/UX Design Fundamentals",
      comment: "This course exceeded all my expectations. The design principles taught here are industry-standard and the instructor's feedback was invaluable. I've completely redesigned my portfolio and landed my dream job!",
      date: "1 week ago"
    },
    {
      id: 5,
      name: "Lisa Wang",
      avatar: "/images/avatars/lisa.jpg",
      rating: 5,
      course: "Data Science with R",
      comment: "Outstanding course! The instructor makes data science accessible and fun. The statistical concepts that seemed intimidating before are now crystal clear. The projects were challenging but incredibly rewarding.",
      date: "2 months ago"
    }
  ]

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, reviews.length])

  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
    setIsAutoPlaying(false)
  }

  const prevReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length)
    setIsAutoPlaying(false)
  }

  const goToReview = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full opacity-10 blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto  relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-current" />
            Student Reviews
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our amazing students have to say about their learning experience.
          </p>
        </div>

        {/* Review Slider */}
        <div className="relative">
          {/* Main Review Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/20 max-w-4xl mx-auto">
            <div className="text-center">
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Quote className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Review Content */}
              <blockquote className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-8 italic">
                "{reviews[currentIndex].comment}"
              </blockquote>

              {/* Rating */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-1">
                  {renderStars(reviews[currentIndex].rating)}
                </div>
              </div>

              {/* Student Info */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">
                    {reviews[currentIndex].name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-900">{reviews[currentIndex].name}</h3>
                  <p className="text-gray-600">{reviews[currentIndex].course}</p>
                  <p className="text-sm text-gray-500">{reviews[currentIndex].date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            onClick={prevReview}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white hover:shadow-xl transition-all duration-300"
            size="sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Button>

          <Button
            onClick={nextReview}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white hover:shadow-xl transition-all duration-300"
            size="sm"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-3 mt-8">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToReview(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-orange-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Auto-play Toggle */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white"
          >
            {isAutoPlaying ? 'Pause' : 'Play'} Auto-Review
          </Button>
        </div>
      </div>
    </section>
  )
}
