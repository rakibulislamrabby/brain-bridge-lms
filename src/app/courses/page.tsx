'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppHeader } from "@/components/app-header"
import Footer from "@/components/shared/Footer"
import AllCourse from "@/components/Courses/AllCourse"
import LiveSessions from "@/components/Home/LiveSessions"
import InPersonSessions from "@/components/Home/InPersonSessions"
import { Video, Users, MapPin, Clock, Loader2 } from 'lucide-react'

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

function CoursesPageContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as CourseCategory | null
  
  // Validate tab parameter and set default
  const getValidTab = (tab: CourseCategory | null): CourseCategory => {
    if (tab && TABS.some(t => t.id === tab)) {
      return tab
    }
    return 'recorded-lesson'
  }

  const [activeTab, setActiveTab] = useState<CourseCategory>(getValidTab(tabParam))

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam) {
      const validTab = getValidTab(tabParam)
      setActiveTab(validTab)
    }
  }, [tabParam])

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

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative flex flex-col items-center gap-2 px-6 py-4 rounded-xl 
                      transition-all duration-300 min-w-[140px] md:min-w-[160px] cursor-pointer
                      ${isActive
                        ? tab.id === 'in-person'
                          ? 'bg-gray-800 text-white border-2 border-orange-500 shadow-sm'
                          : tab.id === 'video-call'
                          ? 'bg-gray-800 text-white border-2 border-purple-500 shadow-sm'
                          : 'bg-gray-800 text-white border-2 border-blue-500 shadow-sm'
                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-orange-500/50 hover:text-white hover:bg-gray-800/80'
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
            <InPersonSessions 
              showPagination={true}
              showHeader={false}
              showShowMore={false}
            />
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

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="px-4 mx-auto bg-gray-900 min-h-screen">
        <AppHeader />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
        </div>
        <Footer />
      </div>
    }>
      <CoursesPageContent />
    </Suspense>
  )
}