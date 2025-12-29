'use client'

import { useState } from "react"
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
  BookOpen,
  Palette,
  GraduationCap,
  Dumbbell,
  Code,
  Heart,
  Briefcase,
  Camera,
  Gamepad2,
  User,
  UserCheck,
  FileText,
  DollarSign,
  PlayCircle
} from 'lucide-react'

const studentSteps = [
  {
    number: 1,
    title: "Choose a Skill",
    description: "Browse skills like coding, music, business, fitness, art, and more.",
    icon: Search,
    color: "purple",
    actionText: "Browse Skills",
    actionLink: "/courses"
  },
  {
    number: 2,
    title: "Pick a Master",
    description: "View real experts, their experience, and availability.",
    icon: UserCheck,
    color: "blue",
    actionText: "Find Masters",
    actionLink: "/masters"
  },
  {
    number: 3,
    title: "Book a Session",
    description: "Select a time and confirm your session instantly.",
    icon: Calendar,
    color: "orange",
    actionText: "Book Now",
    actionLink: "/courses?tab=video-call"
  },
  {
    number: 4,
    title: "Learn Live",
    description: "Join your 1-on-1 or group session by video or chat.",
    icon: PlayCircle,
    color: "purple",
    actionText: "Start Learning",
    actionLink: "/courses"
  },
  {
    number: 5,
    title: "Level Up",
    description: "Practice, rate your Master, and keep growing.",
    icon: Target,
    color: "blue",
    actionText: "View Dashboard",
    actionLink: "/dashboard"
  }
]

const masterSteps = [
  {
    number: 1,
    title: "Apply",
    description: "Submit your skill to join as a Master.",
    icon: FileText,
    color: "purple",
    actionText: "Apply Now",
    actionLink: "/signup?role=master"
  },
  {
    number: 2,
    title: "Get Approved",
    description: "We review your profile to keep quality high.",
    icon: UserCheck,
    color: "blue",
    actionText: "Learn More",
    actionLink: "/signup?role=master"
  },
  {
    number: 3,
    title: "Build Your Profile",
    description: "Add experience, skills, and availability.",
    icon: User,
    color: "orange",
    actionText: "Create Profile",
    actionLink: "/signup?role=master"
  },
  {
    number: 4,
    title: "Teach Sessions",
    description: "Students book you — you teach live.",
    icon: GraduationCap,
    color: "purple",
    actionText: "View Dashboard",
    actionLink: "/dashboard"
  },
  {
    number: 5,
    title: "Get Paid",
    description: "Track sessions and earnings in one dashboard.",
    icon: DollarSign,
    color: "blue",
    actionText: "View Earnings",
    actionLink: "/dashboard"
  }
]

const categories = [
  { name: "Creative arts", icon: Palette, color: "from-purple-500 to-pink-500" },
  { name: "Academic and school success", icon: GraduationCap, color: "from-blue-500 to-cyan-500" },
  { name: "Sports and physical training", icon: Dumbbell, color: "from-red-500 to-pink-500" },
  { name: "Tech and future skills", icon: Code, color: "from-indigo-500 to-purple-500" },
  { name: "Life skills", icon: Heart, color: "from-green-500 to-emerald-500" },
  { name: "Business & Careers", icon: Briefcase, color: "from-orange-500 to-red-500" },
  { name: "Creator and influencer skills", icon: Camera, color: "from-pink-500 to-rose-500" },
  { name: "Hobbies and fun", icon: Gamepad2, color: "from-amber-500 to-orange-500" }
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
  const [activeTab, setActiveTab] = useState<'student' | 'master'>('student')
  const currentSteps = activeTab === 'student' ? studentSteps : masterSteps

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
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              {activeTab === 'student' 
                ? 'Learning made simple. Follow these five steps to start your journey with expert masters.'
                : 'Start teaching and sharing your expertise. Follow these steps to become a Master.'
              }
            </p>

            {/* Tabs */}
            <div className="flex gap-4 justify-center mt-8">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === 'student'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  STUDENTS
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('master')}
                className={`px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === 'master'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  MASTERS
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="space-y-12 md:space-y-16">
              {currentSteps.map((step, index) => {
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

        {/* Session Types Section - Only show for students */}
        {activeTab === 'student' && (
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
        )}

        {/* Categories Section - Only show for students */}
        {activeTab === 'student' && (
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
        )}

        {/* Points System Preview - Only show for students */}
        {activeTab === 'student' && (
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
        )}

        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {activeTab === 'student' 
                    ? 'Ready to Start Learning?'
                    : 'Ready to Start Teaching?'
                  }
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  {activeTab === 'student'
                    ? 'Join thousands of students already learning with expert masters'
                    : 'Join our community of expert Masters and start sharing your knowledge'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {activeTab === 'student' ? (
                    <>
                      <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 cursor-pointer">
                        <Link href="/courses">
                          Browse Courses
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 cursor-pointer">
                        <Link href="/signup?role=student">
                          Create Account
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 cursor-pointer">
                        <Link href="/signup?role=master">
                          Become a Master
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 cursor-pointer">
                        <Link href="/masters">
                          View Masters
                        </Link>
                      </Button>
                    </>
                  )}
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
