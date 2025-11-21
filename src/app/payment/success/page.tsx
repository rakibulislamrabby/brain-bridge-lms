'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Calendar, Clock, Users, ArrowRight, BookOpen } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Parse slot info if present
  let slotInfo = null
  const slotParam = searchParams.get('slot')
  if (slotParam) {
    try {
      slotInfo = JSON.parse(slotParam)
    } catch (error) {
      console.error('🔴 Error parsing slot info:', error)
    }
  }
  
  // Parse course info if present
  let courseInfo = null
  const courseParam = searchParams.get('course')
  if (courseParam) {
    try {
      courseInfo = JSON.parse(courseParam)
    } catch (error) {
      console.error('🔴 Error parsing course info:', error)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':').map(Number)
      const date = new Date(1970, 0, 1, hours, minutes)
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)
    } catch {
      return timeString
    }
  }

  return (
    <Card className="bg-gray-800/80 border border-gray-700">
      <CardContent className="py-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-500/20 p-4">
                  <CheckCircle2 className="h-16 w-16 text-green-400" />
                </div>
              </div>
              
              <CardTitle className="text-3xl text-white mb-3">
                Payment Successful!
              </CardTitle>
              
              <p className="text-gray-300 mb-8">
                {slotInfo 
                  ? 'Your slot has been reserved successfully. You will receive a confirmation email shortly.'
                  : courseInfo
                  ? 'You have been enrolled in the course successfully! You will receive a confirmation email shortly.'
                  : 'Your payment was processed successfully. You will receive a confirmation email shortly.'}
              </p>

              {slotInfo && (
                <Card className="bg-gray-900/50 border border-gray-700 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-left">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-gray-400">Teacher: </span>
                        <span className="text-white font-medium">{slotInfo.teacher}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">Subject: </span>
                      <span className="text-white font-medium">{slotInfo.subject}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">{formatDate(slotInfo.scheduled_date)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">
                        {formatTime(slotInfo.start_time)} - {formatTime(slotInfo.end_time)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {courseInfo && (
                <Card className="bg-gray-900/50 border border-gray-700 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Course Enrollment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-left">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-gray-400">Course: </span>
                        <span className="text-white font-medium">{courseInfo.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">Subject: </span>
                      <span className="text-white font-medium">{courseInfo.subject}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-gray-400">Instructor: </span>
                        <span className="text-white font-medium">{courseInfo.teacher}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4 justify-center">
                {slotInfo ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/live-session')}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Browse More Sessions
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : courseInfo ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/courses')}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Browse More Courses
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
      </div>
    </CardContent>
  </Card>
  )
}

export default function PaymentSuccessPage() {
  return (
    <>
      <AppHeader />
      <main className="bg-gray-900 min-h-screen py-14">
        <div className="max-w-2xl mx-auto px-4">
          <Suspense fallback={
            <Card className="bg-gray-800/80 border border-gray-700">
              <CardContent className="py-12 text-center">
                <div className="text-white">Loading payment details...</div>
              </CardContent>
            </Card>
          }>
            <PaymentSuccessContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
