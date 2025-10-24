'use client'

import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import TeacherBooking from '@/components/dashboard/TeacherBooking'

export default function TeacherPage() {
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <TeacherBooking />
        </div>
      </div>
      <Footer />
    </>
  )
}
