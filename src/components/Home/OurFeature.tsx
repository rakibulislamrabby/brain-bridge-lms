import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Brain, Video, Shield, TrendingUp, Trophy, Smartphone } from 'lucide-react'

export default function OurFeature() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">🌐</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Our Features</h2>
            </div>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Powerful tools designed to enhance your learning and teaching experience
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI Matchmaking",
                description: "Automatically connects students to the most compatible teachers based on skill level and learning goals."
              },
              {
                icon: <Video className="w-8 h-8" />,
                title: "Built-In HD Video",
                description: "No external software needed; learn and teach directly on Brain Bridge."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure Payment Gateway",
                description: "Instant, encrypted, and safe for all users."
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Dynamic Pay Algorithm",
                description: "Automatically adjusts pay according to teacher level, performance, and reviews."
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Community Ranking",
                description: "Highlights top-tier teachers on the homepage and in search results."
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Mobile & Desktop",
                description: "Full functionality across all devices for teaching or learning on the go."
              }
            ].map((feature, index) => (
              <Card key={index} className="p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:bg-gray-200 bg-white hover:border-orange-500 cursor-pointer border border-gray-300 hover:shadow-orange-500/20">
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="text-orange-500 transition-transform duration-300 hover:scale-110">{feature.icon}</div>
                  <h3 className="font-semibold text-base sm:text-lg transition-colors duration-300 hover:text-orange-500 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
  )
}
