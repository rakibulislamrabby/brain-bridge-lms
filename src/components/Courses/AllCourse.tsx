'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePublicCourses } from '@/hooks/course/public/use-public-courses'
import { useLiveSessions } from '@/hooks/live-session/use-live-session'
import CourseCard from './CourseCard'
import {
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
  Video,
  Loader2,
  XCircle,
  Users,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const getCategoryLabel = (course: any) => {
  return course.subject?.name || course.subject_name || course.category || 'General'
}

const getDeliveryMethod = (course: any): 'video_course' | 'live_session' | 'all' => {
  const rawMethod = (course.delivery_method || course.deliveryType || course.type || '').toString().toLowerCase().trim()

  if (!rawMethod) {
    return 'video_course'
  }

  if (['online', 'video', 'video_course', 'self_paced', 'recorded'].includes(rawMethod)) {
    return 'video_course'
  }

  if (['in_person', 'video_call', 'live', 'live_session', 'hybrid', 'webinar'].includes(rawMethod)) {
    return 'live_session'
  }

  return 'video_course'
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
  { id: 'all', label: 'All Options', icon: Grid3X3, disabled: false },
  { id: 'video_course', label: 'Video Course', icon: Video, disabled: false },
  { id: 'live_session', label: 'Live Session (Soon)', icon: Users, disabled: true }
]

const formatDateTime = (dateString: string, timeString: string) => {
  let parsedDate: Date | null = null

  if (dateString) {
    if (dateString.includes('T')) {
      parsedDate = new Date(dateString)
    } else if (timeString) {
      parsedDate = new Date(`${dateString}T${timeString}`)
    } else {
      parsedDate = new Date(dateString)
    }
  }

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return {
      dateLabel: dateString,
      timeLabel: timeString,
    }
  }

  const dateLabel = parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const timeLabel = timeString
    ? timeString
    : parsedDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })

  return { dateLabel, timeLabel }
}

export default function AllCourse() {
  const { data: courses = [], isLoading, error } = usePublicCourses()
  const { data: paginatedLiveSessions, isLoading: liveLoading, error: liveError } = useLiveSessions(1)
  const liveSessions = paginatedLiveSessions?.data || []
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<'all' | 'video_course' | 'live_session'>('video_course')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput)
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timer)
  }, [searchInput])

  const categories = useMemo(() => {
    const unique = new Set<string>()
    courses.forEach((course) => {
      unique.add(getCategoryLabel(course))
    })
    return ['All Categories', ...Array.from(unique)]
  }, [courses])

  const filteredCourses = useMemo(() => {
    let filtered = courses.filter((course) => {
      const categoryLabel = getCategoryLabel(course)
      const deliveryMethod = getDeliveryMethod(course)

      const matchesCategory = selectedCategory === 'All Categories' || categoryLabel === selectedCategory
      const matchesDelivery = selectedDeliveryMethod === 'all' || deliveryMethod === selectedDeliveryMethod

      return matchesCategory && matchesDelivery
    })

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.trim().toLowerCase()
      
      filtered = filtered.filter((course) => {
        // Search in title
        const titleMatch = course.title?.toLowerCase().includes(searchLower) || false
        
        // Search in description
        const descriptionMatch = course.description?.toLowerCase().includes(searchLower) || false
        
        // Search in subject/category
        const categoryLabel = getCategoryLabel(course)
        const subjectMatch = categoryLabel?.toLowerCase().includes(searchLower) || false
        
        // Search in teacher name (if available)
        const teacherName = course.teacher?.name || course.instructor?.name || ''
        const teacherMatch = teacherName?.toLowerCase().includes(searchLower) || false

        return titleMatch || descriptionMatch || subjectMatch || teacherMatch
      })
    }

    return filtered
  }, [courses, selectedCategory, selectedDeliveryMethod, debouncedSearchTerm])

  const hasCourses = courses.length > 0
  const hasLiveSessions = liveSessions.length > 0
  const displayLiveSessions = liveSessions.slice(0, 4)

  return (
    <section className=" bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Recorded Lessons</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Discover self-paced courses tailored to your interests. Filter by category to find the right fit.
          </p>
          
          {/* Search Field */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search courses by title, subject, or instructor..."
                className="pl-10 pr-4 py-6 bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 text-base"
              />
            </div>
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
        ) : hasCourses ? (
          filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-2">
                {debouncedSearchTerm.trim() 
                  ? `No courses found matching "${debouncedSearchTerm}"`
                  : 'No courses found matching your criteria.'}
              </p>
              <Button 
                onClick={() => {
                  setSelectedCategory('All Categories')
                  setSelectedDeliveryMethod('video_course')
                  setSearchInput('')
                  setDebouncedSearchTerm('')
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Reset Filters
              </Button>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No courses found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSelectedCategory('All Categories')
                setSelectedDeliveryMethod('video_course')
                setSearchInput('')
                setDebouncedSearchTerm('')
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
