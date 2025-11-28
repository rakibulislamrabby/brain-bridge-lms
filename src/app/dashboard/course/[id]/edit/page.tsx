'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import EditCourseForm from '@/components/dashboard/EditCourseForm'
import { getStoredUser } from '@/hooks/useAuth'
import { useCourse } from '@/hooks/course/use-courses'
import { Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const courseId = Number(params?.id)

  const [userChecked, setUserChecked] = useState(false)

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/signin')
      return
    }
    setUserChecked(true)
  }, [router])

  const { data: course, isLoading, error } = useCourse(courseId)

  if (!userChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600" />
      </div>
    )
  }

  if (!courseId || Number.isNaN(courseId)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center gap-4 px-4">
        <XCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-white">Invalid course id</h2>
        <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
          <Link href="/dashboard/course">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Unable to load course</h2>
          <p className="text-gray-400 max-w-md">
            {error instanceof Error ? error.message : 'The requested course could not be retrieved. Please try again later.'}
          </p>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
            <Link href="/dashboard/course">Back to Courses</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <EditCourseForm course={course} />
    </DashboardLayout>
  )
}

