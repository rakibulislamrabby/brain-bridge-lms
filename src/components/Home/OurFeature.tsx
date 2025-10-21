import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Brain, Video, Shield, TrendingUp, Trophy, Smartphone } from 'lucide-react'

export default function OurFeature() {
  return (
    <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">🌐</span>
              <h2 className="text-4xl font-bold text-primary">Our Features</h2>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Card key={index} className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:bg-white hover:border-orange-500 cursor-pointer border-2 border-transparent">
                <CardContent className="space-y-4">
                  <div className="text-orange-600 transition-transform duration-300 hover:scale-110">{feature.icon}</div>
                  <h3 className="font-semibold text-lg transition-colors duration-300 hover:text-orange-600">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
  )
}
