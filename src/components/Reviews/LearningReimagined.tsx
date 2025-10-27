import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Users, Video, BookOpen } from 'lucide-react'

export default function LearningReimagined() {
  const learningModes = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "IN-PERSON LESSONS",
      description: "Connect with local teachers for hands-on learning experiences in your community."
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "LIVE VIDEO SESSIONS",
      description: "Join one-on-one video lessons with expert teachers from anywhere in the world."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "RECORDED COURSES",
      description: "Learn at your own pace with high-quality pre-recorded lessons available 24/7."
    }
  ]

  return (
    <section className="py-16 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Learning Reimagined
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choose the learning style that works best for you
          </p>
        </div>

        {/* Simple Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {learningModes.map((mode, index) => (
            <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg hover:border-orange-500 hover:-translate-y-2 hover:scale-105 transition-all duration-500 cursor-pointer group">
              <CardContent className="p-6">
                {/* Icon */}
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                  <div className="text-orange-500 group-hover:text-white transition-colors duration-300">
                    {mode.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                  {mode.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {mode.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
