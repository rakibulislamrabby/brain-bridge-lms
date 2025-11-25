'use client'

import { useMemo, useState } from 'react'
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
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  const hasCourses = courses.length > 0
  const displayCourses = filteredCourses.length > 0 ? filteredCourses : courses
  const hasLiveSessions = liveSessions.length > 0
  const displayLiveSessions = liveSessions.slice(0, 4)

  return (
    <section className="py-8 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Recorded Lessons</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover self-paced courses tailored to your interests. Filter by category to find the right fit.
          </p>
        </div>

        {/* Delivery Method Filter */}
        {/* <div className="mb-8">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-white mb-2">Choose Your Learning Style</h3>
            <p className="text-gray-400">Select how you&apos;d like to learn</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {DELIVERY_METHODS.map((method) => {
              const Icon = method.icon
              const isActive = selectedDeliveryMethod === method.id
              const isDisabled = method.disabled

              return (
                <button
                  key={method.id}
                  onClick={() => {
                    if (!isDisabled) {
                      setSelectedDeliveryMethod(method.id as typeof selectedDeliveryMethod)
                    }
                  }}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? method.id === 'video_course'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : method.id === 'live_session'
                        ? 'bg-purple-600/70 text-white cursor-not-allowed'
                        : 'bg-gray-700 text-white'
                      : isDisabled
                      ? 'bg-gray-800/60 text-gray-500 border border-gray-700 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  <Icon className={isDisabled ? 'w-4 h-4 opacity-60' : 'w-4 h-4'} />
                  {method.label}
                </button>
              )
            })}
          </div>
        </div> */}

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCourses.map((course) => (
              <CourseCard key={course.id} course={course as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No courses found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSelectedCategory('All Categories')
                setSelectedDeliveryMethod('video_course')
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Live Sessions */}
        {/* <div className="mt-20">
          <div className="text-center mb-6">
            <h3 className="text-4xl font-semibold text-white">Live Sessions</h3>
            <p className="text-gray-400 text-xl">Join upcoming one-to-one sessions with expert mentors.</p>
          </div>

          {liveLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : liveError ? (
            <div className="text-center py-10 text-gray-400">
              {liveError instanceof Error ? liveError.message : 'Live sessions are unavailable right now.'}
            </div>
          ) : hasLiveSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayLiveSessions.map((session) => {
                const { dateLabel, timeLabel } = formatDateTime(session.date, session.time)
                return (
                  <Link
                    key={session.id}
                    href={`/live-session/${session.id}`}
                    className="group relative block border border-gray-700 bg-gray-800/80 rounded-xl p-5 space-y-4 transition-all duration-300 ease-out hover:border-blue-500/70 hover:bg-gray-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-white leading-tight">
                        {session.teacher?.name || 'Unknown Instructor'}
                      </p>
                      <p className="text-base text-gray-300">
                        {session.subject?.name || 'General Subject'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">One-to-one live session</p>
                    </div>
                    <div className="flex items-center justify-between text-base text-gray-200">
                      <span>{dateLabel}</span>
                      <span>{timeLabel}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {session.available_seats} seats available
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              Live sessions will be announced soon. Stay tuned!
            </div>
          )}
        </div> */}
      </div>
    </section>
  )
}
