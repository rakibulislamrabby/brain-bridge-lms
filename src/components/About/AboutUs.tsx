import React from 'react'
import { AppHeader } from '../app-header'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Users, Target, Award, Heart, Globe, Zap } from 'lucide-react'
import Footer from '../shared/Footer'
import Link from 'next/link'

export default function AboutUs() {
  const stats = [
    { icon: <Users className="w-6 h-6" />, number: "50K+", label: "Students" },
    { icon: <Target className="w-6 h-6" />, number: "200+", label: "Instructors" },
    { icon: <Award className="w-6 h-6" />, number: "1000+", label: "Courses" },
    { icon: <Globe className="w-6 h-6" />, number: "50+", label: "Countries" }
  ]

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Passion for Learning",
      description: "We believe that learning should be an exciting journey, not a chore. Our platform is designed to ignite curiosity and passion in every student."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Community First",
      description: "Building a supportive learning community where students and instructors can connect, collaborate, and grow together."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Innovation",
      description: "Constantly evolving our platform with cutting-edge technology to provide the best learning experience possible."
    }
  ]

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-orange-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-xs sm:text-sm font-medium mb-4">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                About Brain Bridge
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Empowering Learners
                <br />
                <span className="text-orange-600">Worldwide</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                We're on a mission to make quality education accessible to everyone, everywhere. 
                Through innovative technology and passionate instructors, we're building bridges to knowledge.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <div className="text-orange-600">{stat.icon}</div>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.number}</div>
                  <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Our Story</h2>
                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                  <p>
                    Brain Bridge was born from a simple yet powerful idea: education should be accessible, 
                    engaging, and transformative for everyone, regardless of their location or background.
                  </p>
                  <p>
                    Founded in 2020 by a team of educators and technologists, we've grown from a small 
                    startup to a global platform connecting thousands of students with expert instructors 
                    across diverse fields.
                  </p>
                  <p>
                    Today, we're proud to be at the forefront of online education, continuously innovating 
                    to provide the best learning experience possible while maintaining our core values of 
                    quality, accessibility, and community.
                  </p>
                </div>
              </div>
              <div className="order-1 lg:order-2 bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    To democratize education by connecting passionate learners with expert instructors 
                    through innovative technology, creating a global community where knowledge knows no boundaries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Values</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                These core principles guide everything we do and shape our commitment to excellence.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex justify-center mb-4 sm:mb-6">
                      {value.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{value.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        
      </div>
      <Footer />
    </>
  )
}
