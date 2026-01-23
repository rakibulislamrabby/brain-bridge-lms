'use client'

import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Users, Clock} from 'lucide-react'

export default function TeacherPage() {
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-8">
              <Clock className="w-4 h-4" />
              Coming Soon
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Master Portal
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              We&apos;re building an amazing platform for masters to create, manage, and deliver exceptional learning experiences. 
              Stay tuned for something incredible!
            </p>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
              <Card className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Course Creation</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Create and manage your courses with our intuitive course builder and content management system.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Student Management</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Track student progress, manage enrollments, and provide personalized feedback to your learners.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Scheduling Tools</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Video Call, set office hours, and manage your teaching calendar efficiently.
                  </p>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
