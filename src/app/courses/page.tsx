'use client'

import { useState } from 'react'
import { AppHeader } from "@/components/app-header"
import Footer from "@/components/shared/Footer"
import AllCourse from "@/components/Courses/AllCourse"
import LiveSessions from "@/components/Home/LiveSessions"
import { Video, Users, MapPin, Clock } from 'lucide-react'

type CourseCategory = 'in-person' | 'video-call' | 'recorded-lesson'

interface TabOption {
  id: CourseCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const TABS: TabOption[] = [
  {
    id: 'in-person',
    label: 'In Person',
    icon: MapPin,
    description: 'Face-to-face learning experiences'
  },
  {
    id: 'video-call',
    label: 'Video Call',
    icon: Video,
    description: 'Live one-on-one sessions with expert masters'
  },
  {
    id: 'recorded-lesson',
    label: 'Recorded Lesson',
    icon: Users,
    description: 'Self-paced courses you can learn anytime'
  }
]

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<CourseCategory>('recorded-lesson')

  return (
    <>
      <div className="px-4 mx-auto bg-gray-900 min-h-screen">
        <AppHeader />
        
        {/* Header Section */}
        <section className="py-12 md:py-16 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Choose Your Learning Style
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Explore different ways to learn and grow with our expert masters
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                const isDisabled = tab.id === 'in-person'

                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={`
                      group relative flex flex-col items-center gap-2 px-6 py-4 rounded-xl 
                      transition-all duration-300 min-w-[140px] md:min-w-[160px] cursor-pointer
                      ${isActive
                        ? 'bg-gray-800 text-white border-2 border-purple-500 shadow-sm'
                        : isDisabled
                        ? 'bg-gray-800/50 text-gray-500 border border-gray-700 cursor-not-allowed opacity-60'
                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-purple-500/50 hover:text-white hover:bg-gray-800/80'
                      }
                    `}
                    aria-label={tab.label}
                  >
                    <Icon 
                      className={`w-6 h-6 transition-transform duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`} 
                    />
                    <span className="font-semibold text-sm md:text-base">{tab.label}</span>
                    {tab.id === 'in-person' && (
                      <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full mt-1">
                        Coming Soon
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab Description */}
            <div className="text-center">
              <p className="text-gray-400 text-sm md:text-base">
                {TABS.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-8 md:py-12">
          {activeTab === 'in-person' && (
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-6">
                  <Clock className="w-10 h-10 text-orange-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  In-Person Learning Coming Soon
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                  We're working on bringing you face-to-face learning experiences with expert masters. 
                  Stay tuned for this exciting new way to learn!
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-300 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Coming Soon</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video-call' && (
            <LiveSessions 
              showPagination={true}
              showHeader={false}
              showShowMore={false}
            />
          )}

          {activeTab === 'recorded-lesson' && (
            <AllCourse />
          )}
        </section>
      </div>
      <Footer />
    </>
  )
}