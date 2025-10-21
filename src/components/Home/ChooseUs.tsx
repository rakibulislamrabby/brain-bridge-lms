import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Target, Zap, Shield, Users, Award, Clock } from 'lucide-react'

export default function ChooseUs() {
  return (
    <section className="max-w-7xl mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4 fill-current" />
            Why Choose Us
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Why book with us?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the difference with our premium learning platform designed for your success.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Expert Instructors */}
          <Card className="text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 cursor-pointer pt-6">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">Expert Instructors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                Learn from verified professionals with real-world experience and proven teaching methods that deliver results.
              </CardDescription>
            </CardContent>
          </Card>
          
          {/* Flexible Scheduling */}
          <Card className="text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 cursor-pointer pt-6">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                Book sessions that fit your schedule with our smart calendar system and instant confirmation for seamless learning.
              </CardDescription>
            </CardContent>
          </Card>
          
          {/* Secure & Safe */}
          <Card className="text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 cursor-pointer pt-6">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">Secure & Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                Protected payments, verified instructors, and a safe learning environment for everyone's peace of mind.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

  )
}
