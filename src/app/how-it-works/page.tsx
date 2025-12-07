'use client'

import { AppHeader } from "@/components/app-header"
import Footer from "@/components/shared/Footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Search, 
  Sparkles, 
  Calendar, 
  Users, 
  Gift,
  ArrowRight,
  Target,
  MapPin,
  Video,
  BookOpen
} from 'lucide-react'

const steps = [
  {
    number: 1,
    title: "Tell Us What You Want to Learn",
    description: "Choose a skill — from the main categories at the bottom of this page",
    icon: Search,
    color: "purple",
    actionText: "Browse Categories",
    actionLink: "/courses"
  },
  {
    number: 2,
    title: "Get Instantly Matched",
    description: "Our AI matches you with the best Master Teacher based on skill, level, availability, and teaching style.",
    icon: Sparkles,
    color: "blue",
    actionText: "Find Your Match",
    actionLink: "/courses"
  },
  {
    number: 3,
    title: "Book in Session",
    description: "Choose in-person, video call, or online session. Pick a time and lock it in instantly.",
    icon: Calendar,
    color: "orange",
    actionText: "View Sessions",
    actionLink: "/courses?tab=video-call"
  },
  {
    number: 4,
    title: "Learn One-on-One",
    description: "Join your session and get real, hands-on guidance — not prerecorded videos.",
    icon: Users,
    color: "purple",
    actionText: "Start Learning",
    actionLink: "/courses?tab=in-person"
  },
  {
    number: 5,
    title: "Earn Rewards Every Time",
    description: "Every session gives you points. Points unlock discounts, free lessons, and exclusive perks.",
    icon: Gift,
    color: "blue",
    actionText: "Learn About Points",
    actionLink: "/points"
  }
]

const categories = [
  { name: "Programming", icon: Target, color: "from-blue-500 to-cyan-500" },
  { name: "Design", icon: Target, color: "from-purple-500 to-pink-500" },
  { name: "Business", icon: Target, color: "from-orange-500 to-red-500" },
  { name: "Marketing", icon: Target, color: "from-green-500 to-emerald-500" },
  { name: "Photography", icon: Target, color: "from-indigo-500 to-purple-500" },
  { name: "Music", icon: Target, color: "from-pink-500 to-rose-500" },
  { name: "Cooking", icon: Target, color: "from-amber-500 to-orange-500" },
  { name: "Fitness", icon: Target, color: "from-red-500 to-pink-500" }
]

const sessionTypes = [
  {
    type: "In Person",
    icon: MapPin,
    description: "Face-to-face learning experiences",
    status: "Coming Soon"
  },
  {
    type: "Video Call",
    icon: Video,
    description: "Live one-on-one sessions with expert masters",
    status: "Available"
  },
  {
    type: "Recorded Lesson",
    icon: BookOpen,
    description: "Self-paced courses you can learn anytime",
    status: "Available"
  }
]

export default function HowItWorksPage() {
  return (
    <>
      <div className="bg-gray-900 min-h-screen">
        <AppHeader />
        
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-orange-500/10 to-blue-500/10"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              How It Works
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Learning made simple. Follow these five steps to start your journey with expert masters.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="space-y-12 md:space-y-16">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isEven = index % 2 === 1
                const colorClasses = {
                  purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
                  blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
                  orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30"
                }

                return (
                  <div
                    key={step.number}
                    className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-12`}
                  >
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses]} border-2 flex items-center justify-center`}>
                        <div className="absolute -top-3 -left-3 w-12 h-12 bg-gray-900 rounded-full border-2 border-purple-500 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">{step.number}</span>
                        </div>
                        <Icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <Card className="flex-1 bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                      <CardContent className="p-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                          {step.title}
                        </h2>
                        <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                          {step.description}
                        </p>
                        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer">
                          <Link href={step.actionLink}>
                            {step.actionText}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Session Types Section */}
        <section className="py-16 md:py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Choose Your Learning Style
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Pick the format that works best for you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {sessionTypes.map((session) => {
                const Icon = session.icon
                return (
                  <Card key={session.type} className="bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{session.type}</h3>
                      <p className="text-gray-400 text-sm mb-4">{session.description}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'Available' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {session.status}
                      </span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-20" id="categories">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Main Categories
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Choose a skill from these popular categories
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Link
                    key={category.name}
                    href="/courses"
                    className="group relative block"
                  >
                    <Card className="bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                          {category.name}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer">
                <Link href="/courses">
                  View All Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Points System Preview */}
        <section className="py-16 md:py-20 bg-gray-800/30" id="points">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Gift className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Earn Rewards Every Time
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Every session gives you points. Points unlock discounts, free lessons, and exclusive perks.
              The more you learn, the more you earn!
            </p>
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer">
              <Link href="/points">
                Learn More About Points
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Start Learning?
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Join thousands of students already learning with expert masters
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 cursor-pointer">
                    <Link href="/courses">
                      Browse Courses
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 cursor-pointer">
                    <Link href="/signup">
                      Create Account
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
