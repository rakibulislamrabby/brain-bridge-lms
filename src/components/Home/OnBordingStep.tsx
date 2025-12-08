'use client'

import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  UserPlus, 
  BookOpen, 
  Users, 
  Calendar, 
  GraduationCap, 
  Clock, 
  PlayCircle,
  ArrowRight
} from 'lucide-react'

interface OnBordingStepProps {
  variant?: 'student' | 'master' | 'both'
}

type StepType = {
  number: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface StepCardProps {
  step: StepType
  index: number
  totalSteps: number
  isMobile?: boolean
}

function StepCard({ step, index, totalSteps, isMobile = false }: StepCardProps) {
  const Icon = step.icon
  const isLast = index === totalSteps - 1
  const isOrange = step.color === 'orange'

  if (isMobile) {
    return (
      <React.Fragment>
        <Card className="border-0 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group h-full">
          <CardContent className="p-5 flex flex-col h-full">
            <div className="flex items-start gap-4 flex-1">
              {/* Combined Step Number and Icon */}
              <div className="flex-shrink-0 relative">
                <div className={`relative flex items-center justify-center w-16 h-16 rounded-xl ${
                  isOrange 
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' 
                    : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${
                    isOrange ? 'text-white' : 'text-white'
                  }`} />
                </div>
                {/* Step Number Badge */}
                <div className={`absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 rounded-full border-2 border-gray-900 ${
                  isOrange 
                    ? 'bg-orange-400' 
                    : 'bg-purple-400'
                } shadow-lg`}>
                  <span className="text-xs font-bold text-white">{step.number}</span>
                </div>
              </div>
              <div className="flex-1 pt-1 flex flex-col">
                <h3 className={`text-lg font-bold mb-2 ${
                  isOrange ? 'text-orange-400' : 'text-purple-400'
                } group-hover:text-white transition-colors duration-300`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300 flex-1">
                  {step.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {!isLast && (
          <div className="flex items-center justify-center py-2">
            <div className={`relative ${
              isOrange ? 'text-orange-500' : 'text-purple-500'
            }`}>
              <ArrowRight className="w-6 h-6 rotate-90 animate-pulse" />
              <div className={`absolute inset-0 ${
                isOrange ? 'text-orange-500/30' : 'text-purple-500/30'
              } blur-md`}>
                <ArrowRight className="w-6 h-6 rotate-90" />
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <div className="flex flex-col items-center flex-1 w-[240px]">
        <Card className="w-full h-[320px] border-0 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20 group flex flex-col">
          <CardContent className="p-6 sm:p-8 text-center flex flex-col h-full">
            {/* Combined Step Number and Icon Container */}
            <div className="relative inline-flex items-center justify-center mb-5 flex-shrink-0">
              {/* Main Icon Container */}
              <div className={`relative flex items-center justify-center w-20 h-20 rounded-2xl ${
                isOrange 
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30'
              } group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              {/* Step Number Badge - Positioned at top-right */}
              <div className={`absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-900 ${
                isOrange 
                  ? 'bg-orange-400 shadow-lg shadow-orange-500/50' 
                  : 'bg-purple-400 shadow-lg shadow-purple-500/50'
              } group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-sm font-bold text-white">{step.number}</span>
              </div>
            </div>
            
            <h3 className={`text-lg sm:text-xl font-bold mb-3 flex-shrink-0 ${
              isOrange ? 'text-orange-400' : 'text-purple-400'
            } group-hover:text-white transition-colors duration-300`}>
              {step.title}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300 flex-1">
              {step.description}
            </p>
          </CardContent>
        </Card>
      </div>
      {!isLast && (
        <div className="flex items-center justify-center pt-8 px-2">
          <div className={`relative ${
            isOrange ? 'text-orange-500' : 'text-purple-500'
          }`}>
            <ArrowRight className="w-8 h-8 lg:w-10 lg:h-10 animate-pulse" />
            <div className={`absolute inset-0 ${
              isOrange ? 'text-orange-500/30' : 'text-purple-500/30'
            } blur-md`}>
              <ArrowRight className="w-8 h-8 lg:w-10 lg:h-10" />
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

function OnboardingSection({ steps, title, subtitle }: { 
  steps: StepType[], 
  title: string, 
  subtitle: string 
}) {
  return (
    <div className="mb-16 last:mb-0">
      <div className="text-center mb-12 sm:mb-16">
        <Badge className="bg-purple-900/30 text-purple-400 border border-purple-600/40 mb-4">
          {title}
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          {title === 'Student Onboarding' ? 'How to Get Started' : 'Become a Master'}
        </h2>
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="relative">
        <div className="hidden lg:flex items-start justify-center gap-4 lg:gap-6 xl:gap-8 w-full">
          {steps.map((step, index) => (
            <StepCard 
              key={step.number} 
              step={step} 
              index={index} 
              totalSteps={steps.length}
              isMobile={false}
            />
          ))}
        </div>

        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <StepCard 
              key={step.number} 
              step={step} 
              index={index} 
              totalSteps={steps.length}
              isMobile={true}
            />
          ))}
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-2">
        {steps.map((step) => {
          const isOrange = step.color === 'orange'
          return (
            <div
              key={step.number}
              className={`h-2 rounded-full transition-all duration-300 ${
                isOrange ? 'bg-orange-500 w-8' : 'bg-purple-500 w-6'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function OnBordingStep({ variant = 'both' }: OnBordingStepProps) {
  const studentSteps = [
    {
      number: 1,
      title: 'Create Profile',
      description: 'Set up your student profile with your interests and learning goals',
      icon: UserPlus,
      color: 'purple'
    },
    {
      number: 2,
      title: 'Pick Skill',
      description: 'Browse and select the skills you want to learn',
      icon: BookOpen,
      color: 'purple'
    },
    {
      number: 3,
      title: 'Pick Master',
      description: 'Choose from our verified masters who specialize in your chosen skill',
      icon: Users,
      color: 'purple'
    },
    {
      number: 4,
      title: 'Book Session',
      description: 'Schedule your learning session at a time that works for you',
      icon: Calendar,
      color: 'orange'
    }
  ]

  const masterSteps = [
    {
      number: 1,
      title: 'Create Profile',
      description: 'Set up your master profile showcasing your expertise and experience',
      icon: GraduationCap,
      color: 'purple'
    },
    {
      number: 2,
      title: 'Create your Course',
      description: 'Design and publish your course with engaging content and materials',
      icon: BookOpen,
      color: 'purple'
    },
    {
      number: 3,
      title: 'Set Availability',
      description: 'Define your teaching schedule and available time slots',
      icon: Clock,
      color: 'purple'
    },
    {
      number: 4,
      title: 'Start Teaching',
      description: 'Begin sharing your knowledge and helping students achieve their goals',
      icon: PlayCircle,
      color: 'orange'
    }
  ]

  if (variant === 'both') {
    return (
      <section className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <OnboardingSection
          steps={studentSteps}
          title="Student Onboarding"
          subtitle="Start your learning journey in just 4 simple steps"
        />
        <OnboardingSection
          steps={masterSteps}
          title="Master Onboarding"
          subtitle="Begin your teaching journey in just 4 simple steps"
        />
      </section>
    )
  }

  const steps = variant === 'student' ? studentSteps : masterSteps
  const title = variant === 'student' ? 'Student Onboarding' : 'Master Onboarding'
  const subtitle = variant === 'student' 
    ? 'Start your learning journey in just 4 simple steps'
    : 'Begin your teaching journey in just 4 simple steps'

  return (
    <section className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <OnboardingSection
        steps={steps}
        title={title}
        subtitle={subtitle}
      />
    </section>
  )
}
