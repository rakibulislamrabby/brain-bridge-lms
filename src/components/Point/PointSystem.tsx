import React from 'react'
import { Card, CardContent } from '../ui/card'
import { BookOpen, Clock, Gift, Star, Trophy, Zap } from 'lucide-react'

export default function PointSystem() {
  const earningMethods = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "BOOK SESSIONS",
      description: "As a student, you earn points by booking learning sessions with masters on our platform.",
      points: "+5 POINTS PER BOOKING",
      color: "bg-orange-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "HOURLY REWARDS",
      description: "Points are calculated based on the hours spent learning with your master during sessions.",
      points: "+25 POINTS PER HOUR",
      color: "bg-orange-500"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "COMPLETE COURSES",
      description: "Finish entire courses and earn bonus points for your dedication and commitment.",
      points: "+100 POINTS PER COURSE",
      color: "bg-orange-500"
    }
  ]

  const rewards = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Free Sessions",
      description: "Redeem points for complimentary learning sessions",
      cost: "500 points",
      popular: false
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Premium Courses",
      description: "Access exclusive premium courses at discounted rates",
      cost: "1000 points",
      popular: true
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Priority Booking",
      description: "Get priority access to popular instructors by location",
      cost: "750 points",
      popular: false
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="">
        {/* Header */}
        <div className="text-center mb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            BRAINBRIDGE POINTS SYSTEM
          </h2>
          
          {/* Purple Info Box */}
          <div className="bg-purple-100 border border-purple-200 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              Earn points with every learning session and unlock amazing rewards. The more you learn, the more you earn!
            </p>
          </div>

          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            HOW TO EARN POINTS
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our points system is designed to reward active learning and engagement. Here&apos;s how you can accumulate points:
          </p>
        </div>

        {/* Earning Methods */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
          {earningMethods.map((method, index) => (
            <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg hover:border-orange-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-8 text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                  <div className="text-orange-500 group-hover:text-white transition-colors duration-300">
                    {method.icon}
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                  {method.title}
                </h4>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {method.description}
                </p>

                {/* Points Button */}
                <div className={`${method.color} text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 group-hover:shadow-lg`}>
                  {method.points}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rewards Section with Slate Background */}
        <div className="bg-slate-900 p-12 mb-12 ">
          <div className="text-center mb-12 max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              REDEEM YOUR POINTS
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Use your earned points to unlock exclusive benefits and save on future learning experiences.
            </p>
          </div>

          {/* Rewards Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {rewards.map((reward, index) => (
              <Card key={index} className={`relative bg-white border border-gray-200 hover:shadow-lg hover:border-purple-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer group ${
                reward.popular ? 'ring-2 ring-purple-200' : ''
              }`}>
                {reward.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}
                
                <CardContent className="p-6 text-center">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                    <div className="text-purple-500 group-hover:text-white transition-colors duration-300">
                      {reward.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                    {reward.title}
                  </h4>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {reward.description}
                  </p>

                  {/* Cost */}
                  <div className="bg-purple-500 text-white font-bold py-2 px-4 rounded-lg text-sm">
                    {reward.cost}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of students who are already earning points and unlocking rewards!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-orange-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                Start Learning Now
              </button>
              <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-white hover:text-orange-600 transition-all duration-300">
                View Points Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
