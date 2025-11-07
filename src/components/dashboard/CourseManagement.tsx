'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Search,
  Loader2,
  XCircle,
  Plus,
  TrendingUp,
  Users,
  Star,
  Layers,
  Film
} from 'lucide-react'
import { useCourses } from '@/hooks/course/use-courses'

const getStatus = (course: any) => {
  if (course.status) {
    return course.status
  }

  const value = course.is_published
  if (value === true || value === 1 || value === '1') {
    return 'published'
  }

  return 'draft'
}

const getSubjectName = (course: any) => {
  return course.subject?.name || course.subject_name || '—'
}

const getTeacherName = (course: any) => {
  return course.teacher?.name || course.teacher_name || '—'
}

const getModulesCount = (course: any) => {
  if (typeof course.modules_count === 'number') {
    return course.modules_count
  }
  if (Array.isArray(course.modules)) {
    return course.modules.length
  }
  return 0
}

const getVideosCount = (course: any) => {
  if (typeof course.videos_count === 'number') {
    return course.videos_count
  }
  if (Array.isArray(course.videos)) {
    return course.videos.length
  }
  return 0
}

const getStudentsCount = (course: any) => {
  return course.students_count ?? course.total_students ?? 0
}

const getAverageRating = (course: any) => {
  return course.average_rating ?? course.rating ?? null
}

const getPriceLabel = (course: any) => {
  if (course.price === undefined || course.price === null || course.price === '') {
    return '—'
  }

  const priceNumber = Number(course.price)
  if (!Number.isNaN(priceNumber)) {
    return `$${priceNumber.toFixed(2)}`
  }

  return String(course.price)
}

const formatDate = (value?: string) => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function CourseManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const { data: courses = [], isLoading: loading, error } = useCourses()

  const subjectOptions = useMemo(() => {
    const subjects = new Set<string>()
    courses.forEach((course) => {
      const subjectName = getSubjectName(course)
      if (subjectName && subjectName !== '—') {
        subjects.add(subjectName)
      }
    })
    return ['all', ...Array.from(subjects)]
  }, [courses])

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return courses.filter((course) => {
      const subjectName = getSubjectName(course)
      const matchesSubject = filterSubject === 'all' || subjectName.toLowerCase() === filterSubject.toLowerCase()

      if (!term) {
        return matchesSubject
      }

      const titleMatch = course.title?.toLowerCase().includes(term)
      const descriptionMatch = course.description?.toLowerCase().includes(term)
      const subjectMatch = subjectName?.toLowerCase().includes(term)
      const teacherMatch = getTeacherName(course)?.toLowerCase().includes(term)

      return matchesSubject && (titleMatch || descriptionMatch || subjectMatch || teacherMatch)
    })
  }, [courses, searchTerm, filterSubject])

  const stats = useMemo(() => {
    if (!courses.length) {
      return {
        total: 0,
        published: 0,
        draft: 0,
        totalStudents: 0,
        averageRating: '0.0',
      }
    }

    const publishedCount = courses.filter((course) => getStatus(course) === 'published').length
    const draftCount = courses.length - publishedCount
    const studentsTotal = courses.reduce((sum, course) => sum + getStudentsCount(course), 0)
    const ratings = courses
      .map((course) => getAverageRating(course))
      .filter((value) => typeof value === 'number') as number[]

    const averageRating = ratings.length
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
      : '0.0'

    return {
      total: courses.length,
      published: publishedCount,
      draft: draftCount,
      totalStudents: studentsTotal,
      averageRating,
    }
  }, [courses])

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="py-16 text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-white">Failed to load courses</h3>
          <p className="text-gray-400">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Course Management</h1>
          <p className="text-gray-400 mt-2">Monitor and manage all courses on the platform</p>
        </div>
        <Link href="/dashboard/course/add-course">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <BookOpen className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Published</p>
              <p className="text-2xl font-bold text-white">{stats.published}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-white">{stats.totalStudents.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title, subject, or teacher..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filterSubject}
                onChange={(event) => setFilterSubject(event.target.value)}
                className="px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 pt-5">
            <BookOpen className="h-5 w-5 text-orange-500" />
            Courses
          </CardTitle>
          <CardDescription className="text-gray-400">
            Overview of all courses fetched from the Brain Bridge API
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              No courses found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-900/60">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Course</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Teacher</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Modules</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Videos</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => {
                    const status = getStatus(course)
                    const subjectName = getSubjectName(course)
                    const teacherName = getTeacherName(course)
                    const modulesCount = getModulesCount(course)
                    const videosCount = getVideosCount(course)
                    const priceLabel = getPriceLabel(course)

                    return (
                      <tr key={course.id} className="border-t border-gray-700/60 hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-semibold text-white">{course.title || 'Untitled Course'}</p>
                            <p className="text-xs text-gray-400 line-clamp-2 max-w-[360px]">
                              {course.description || 'No description provided.'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">{subjectName}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{teacherName}</td>
                        <td className="py-3 px-4 text-sm text-gray-300 flex items-center gap-2">
                          <Layers className="h-4 w-4 text-orange-500" />
                          {modulesCount}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300 flex items-center gap-2">
                          <Film className="h-4 w-4 text-orange-500" />
                          {videosCount}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={status === 'published' ? 'bg-green-600/80 text-white' : 'bg-yellow-600/80 text-white'}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">{priceLabel}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{formatDate(course.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
