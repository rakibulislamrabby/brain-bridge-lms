'use client'

import React, { useState } from 'react'
import CourseCard from './CourseCard'
import coursesData from '../../data/courses.json'
import { Laptop, Palette, Code, Globe, GraduationCap, TrendingUp, Grid3X3, Calculator, Dumbbell, Music, Briefcase, Paintbrush, ChefHat } from 'lucide-react'

export default function AllCourse() {
  const allCourses = coursesData.courses
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  
  // Get unique categories from courses
  const categories = ['All Categories', ...Array.from(new Set(allCourses.map(course => course.category)))]
  
  // Filter courses based on selected category
  const courses = selectedCategory === 'All Categories' 
    ? allCourses 
    : allCourses.filter(course => course.category === selectedCategory)

  return (
    <section className="pt-20 bg-gray-50">
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

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => {
            const isActive = selectedCategory === category
            const getIcon = (cat: string) => {
              switch (cat) {
                case 'All Categories': return <Grid3X3 className="w-4 h-4" />
                case 'Design': return <Palette className="w-4 h-4" />
                case 'Programming': return <Code className="w-4 h-4" />
                case 'Web Development': return <Globe className="w-4 h-4" />
                case 'Marketing': return <TrendingUp className="w-4 h-4" />
                case 'Photography': return <Palette className="w-4 h-4" />
                case 'Business': return <Briefcase className="w-4 h-4" />
                case 'Academics': return <Calculator className="w-4 h-4" />
                case 'Fitness': return <Dumbbell className="w-4 h-4" />
                case 'Music': return <Music className="w-4 h-4" />
                case 'Art': return <Paintbrush className="w-4 h-4" />
                case 'Cooking': return <ChefHat className="w-4 h-4" />
                default: return <Grid3X3 className="w-4 h-4" />
              }
            }
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {getIcon(category)}
                {category}
              </button>
            )
          })}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-300">
            Load More Courses
          </button>
        </div>
      </div>
    </section>
  )
}
