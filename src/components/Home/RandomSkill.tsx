
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Shuffle, Sparkles, ArrowRight, Star } from 'lucide-react'
import coursesData from '../../data/courses.json'

interface Course {
  id: number
  course_title: string
  description: string
  category: string
  tags: string[]
}

export default function RandomSkill() {
  const [randomCourse, setRandomCourse] = useState<Course | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const courses: Course[] = coursesData.courses

  const generateRandomSkill = () => {
    setIsGenerating(true)
    setShowResult(false)
    
    // Simulate loading animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * courses.length)
      setRandomCourse(courses[randomIndex])
      setIsGenerating(false)
      setShowResult(true)
    }, 1500)
  }

  return (
    <section className="relative pt-0 pb-16 sm:pb-20 lg:pb-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-blue-500/5"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/10 rounded-full blur-lg"></div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
        <div className="text-center mb-16">
          {/* Animated title with gradient */}
          <div className="relative inline-block mb-6">
            <h2 className="text-4xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent leading-tight">
              DISCOVER SOMETHING NEW
            </h2>
          </div>
          
          {/* Enhanced description */}
          <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
            Not sure what to learn next? Let our intelligent skill generator inspire your next learning adventure and unlock your potential.
          </p>
          
          {/* Enhanced button with animations */}
          <div className="relative inline-block">
            <Button 
              onClick={generateRandomSkill}
              disabled={isGenerating}
              className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-orange-500/25 border-0 overflow-hidden cursor-pointer"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Button content */}
              <div className="relative flex items-center space-x-3">
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>GENERATING...</span>
                  </>
                ) : (
                  <>
                    <Shuffle className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    <span>GENERATE RANDOM SKILL</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>

        {/* Simple result display */}
        {randomCourse && (
          <div className={`flex justify-center transition-all duration-500 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="w-full max-w-md bg-purple-100 border border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {randomCourse.course_title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Click to find masters for this skill or similar subjects
                </p>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer">
                  Find Teachers
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
