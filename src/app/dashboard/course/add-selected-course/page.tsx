'use client'

import { useState, useMemo, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCourses, useSelectMainCourses } from '@/hooks/course/use-courses'
import { useMe } from '@/hooks/use-me'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function AddSelectedCoursePage() {
  const { data: courses = [], isLoading, error } = useCourses()
  const { data: user } = useMe()
  const { addToast } = useToast()
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([])
  const selectMainCoursesMutation = useSelectMainCourses()

  // Filter courses to show only teacher's own courses
  const teacherCourses = useMemo(() => {
    if (!courses || !user) return []
    return courses.filter(course => {
      // Check if course belongs to current teacher
      // Assuming course has a teacher_id or teacher object
      const courseTeacherId = course.teacher_id || course.teacher?.id
      return courseTeacherId === user.id
    })
  }, [courses, user])

  // Pre-select courses where is_main === 1
  useEffect(() => {
    if (teacherCourses.length > 0) {
      const mainCourseIds = teacherCourses
        .filter(course => course.is_main === 1)
        .map(course => course.id)
      if (mainCourseIds.length > 0) {
        setSelectedCourseIds(mainCourseIds)
      }
    }
  }, [teacherCourses])

  const handleToggleCourse = (courseId: number) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCourseIds.length === teacherCourses.length) {
      setSelectedCourseIds([])
    } else {
      setSelectedCourseIds(teacherCourses.map(course => course.id))
    }
  }

  const handleSubmit = async () => {
    try {
      await selectMainCoursesMutation.mutateAsync(selectedCourseIds)
      
      addToast({
        type: 'success',
        title: 'Courses Updated',
        description: selectedCourseIds.length > 0
          ? `Successfully selected ${selectedCourseIds.length} course(s) as main courses.`
          : 'Successfully cleared all main course selections.',
        duration: 5000,
      })
      
      // Reset selection after successful submission
      setSelectedCourseIds([])
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit selected courses.',
        duration: 5000,
      })
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="bg-red-900/20 border border-red-700/60">
          <CardContent className="py-16 text-center">
            <p className="text-red-200/90">
              {error instanceof Error ? error.message : 'Unable to load courses. Please try again.'}
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Selected Main Recorded Lesson</h1>
            <p className="text-gray-400 mt-2">
              Select lessons from your lesson list to add them
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
            >
              {selectedCourseIds.length === teacherCourses.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectMainCoursesMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
            >
              {selectMainCoursesMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  OK ({selectedCourseIds.length})
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Course Cards Grid */}
        {teacherCourses.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-16 text-center">
              <p className="text-gray-400">
                You don&apos;t have any courses yet. Create a course first.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherCourses.map((course) => {
              const isSelected = selectedCourseIds.includes(course.id)
              
              return (
                <Card
                  key={course.id}
                  className={`bg-gray-800 border-2 transition-all duration-200 cursor-pointer hover:border-orange-500/50 ${
                    isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700'
                  }`}
                  onClick={() => handleToggleCourse(course.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCourse(course.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">
                          {course.title || 'Untitled Course'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {course.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-medium text-orange-400">
                            {course.price ? `$${Number(course.price).toFixed(2)}` : 'Free'}
                          </span>
                          {course.subject && (
                            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                              {typeof course.subject === 'object' ? course.subject.name : course.subject}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

