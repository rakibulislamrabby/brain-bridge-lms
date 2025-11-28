import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Target, Shield, Award, Clock } from 'lucide-react'

export default function ChooseUs() {
  return (
    <section className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-900/30 text-purple-400 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Award className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
            Why Choose Us
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4">Why book with us?</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">Experience the difference with our premium learning platform designed for your success.</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Expert Instructors */}
          <Card className="text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gray-800/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-purple-900/20 hover:to-purple-800/20 cursor-pointer pt-4 sm:pt-6">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">Expert Instructors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                Learn from verified professionals with real-world experience and proven teaching methods that deliver results.
              </CardDescription>
            </CardContent>
          </Card>
          
          {/* Flexible Scheduling */}
          <Card className="text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gray-800/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-blue-900/20 hover:to-blue-800/20 cursor-pointer pt-4 sm:pt-6">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                Book sessions that fit your schedule with our smart calendar system and instant confirmation for seamless learning.
              </CardDescription>
            </CardContent>
          </Card>
          
          {/* Secure & Safe */}
          <Card className="text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gray-800/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-green-900/20 hover:to-green-800/20 cursor-pointer pt-4 sm:pt-6 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">Secure & Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                Protected payments, verified instructors, and a safe learning environment for everyone&apos;s peace of mind.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

  )
}
