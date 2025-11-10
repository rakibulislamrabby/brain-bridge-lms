'use client'

import { useMemo, useState } from 'react'
import { useCourses } from '@/hooks/course/use-courses'
import CourseCard from './CourseCard'
import {
  Laptop,
  Palette,
  Code,
  Globe,
  TrendingUp,
  Grid3X3,
  Calculator,
  Dumbbell,
  Music,
  Briefcase,
  Paintbrush,
  ChefHat,
  MapPin,
  Video,
  Monitor,
  Loader2,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const getCategoryLabel = (course: any) => {
  return course.subject?.name || course.subject_name || course.category || 'General'
}

const getDeliveryMethod = (course: any): 'in_person' | 'video_call' | 'online' | 'all' => {
  if (course.delivery_method === 'in_person' || course.delivery_method === 'video_call' || course.delivery_method === 'online') {
    return course.delivery_method
  }
  return 'all'
}

const getIconForCategory = (category: string) => {
  switch (category) {
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

const DELIVERY_METHODS = [
  { id: 'all', label: 'All Options', icon: Grid3X3 },
  { id: 'in_person', label: 'In-Person', icon: MapPin },
  { id: 'video_call', label: 'Video Call', icon: Video },
  { id: 'online', label: 'Online-Only', icon: Monitor }
]

export default function AllCourse() {
  const { data: courses = [], isLoading, error } = useCourses()
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<'all' | 'in_person' | 'video_call' | 'online'>('all')

  const categories = useMemo(() => {
    const unique = new Set<string>()
    courses.forEach((course) => {
      unique.add(getCategoryLabel(course))
    })
    return ['All Categories', ...Array.from(unique)]
  }, [courses])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const categoryLabel = getCategoryLabel(course)
      const deliveryMethod = getDeliveryMethod(course)

      const matchesCategory = selectedCategory === 'All Categories' || categoryLabel === selectedCategory
      const matchesDelivery = selectedDeliveryMethod === 'all' || deliveryMethod === selectedDeliveryMethod

      return matchesCategory && matchesDelivery
    })
  }, [courses, selectedCategory, selectedDeliveryMethod])

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Laptop className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Popular Courses</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Pick A Course To Get Started</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover courses tailored to your interests. Filter by category or delivery method to find the right fit.
          </p>
        </div>

        {/* Delivery Method Filter */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-white mb-2">Choose Your Learning Style</h3>
            <p className="text-gray-400">Select how you&apos;d like to learn</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {DELIVERY_METHODS.map((method) => {
              const Icon = method.icon
              const isActive = selectedDeliveryMethod === method.id
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedDeliveryMethod(method.id as typeof selectedDeliveryMethod)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? method.id === 'in_person'
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/50'
                        : method.id === 'video_call'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                        : method.id === 'online'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-gray-700 text-white'
                      : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {method.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((category) => {
            const isActive = selectedCategory === category

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-blue-400 hover:text-blue-400'
                }`}
              >
                {getIconForCategory(category)}
                {category}
              </button>
            )
          })}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-gray-400">
              {error instanceof Error ? error.message : 'Failed to load courses. Please try again later.'}
            </p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No courses found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSelectedCategory('All Categories')
                setSelectedDeliveryMethod('all')
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
