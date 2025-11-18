'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Users, GraduationCap, Calendar, Loader2, XCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLiveSessions } from '@/hooks/live-session/use-live-session'

const buildGroupKey = (teacherId?: number, subjectId?: number) => {
  return `${teacherId ?? 'unknown'}-${subjectId ?? 'unknown'}`
}

export default function LiveSessions() {
  const { data: paginatedData, isLoading, error } = useLiveSessions(1)
  const slots = paginatedData?.data || []

  const groupedSlots = useMemo(() => {
    const map = new Map<string, {
      teacherName: string
      teacherEmail?: string
      subjectName: string
      sessions: typeof slots
    }>()

    slots.forEach((slot) => {
      const key = buildGroupKey(slot.teacher?.id, slot.subject?.id)
      const existing = map.get(key)

      if (existing) {
        existing.sessions.push(slot)
      } else {
        map.set(key, {
          teacherName: slot.teacher?.name ?? 'Unknown Teacher',
          teacherEmail: slot.teacher?.email ?? undefined,
          subjectName: slot.subject?.name ?? 'General Subject',
          sessions: [slot],
        })
      }
    })

    return Array.from(map.values()).map((group) => ({
      ...group,
      sessions: group.sessions.sort((a, b) => {
        const dateA = a.from_date ? new Date(a.from_date).getTime() : (a.date ? new Date(a.date).getTime() : 0)
        const dateB = b.from_date ? new Date(b.from_date).getTime() : (b.date ? new Date(b.date).getTime() : 0)
        if (dateA !== dateB) {
          return dateA - dateB
        }
        return a.id - b.id
      }),
    }))
  }, [slots])

  const displaySlots = groupedSlots.slice(0, 6)

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-medium">Live Sessions</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Book a Live Session with Expert Mentors</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore upcoming live sessions hosted by our verified instructors. Reserve your seat to get personal guidance in real time.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-gray-300">
              {error instanceof Error ? error.message : 'Unable to load live sessions right now. Please try again later.'}
            </p>
          </div>
        ) : displaySlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <Users className="h-12 w-12 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">No live sessions available</h3>
            <p className="text-gray-400 max-w-md">
              Check back soon—mentors constantly add new live sessions to the schedule.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displaySlots.map((group, index) => {
                const primarySessionId = group.sessions[0]?.id

                return (
                  <Card key={`${group.teacherName}-${group.subjectName}-${index}`} className="bg-gray-800/80 border border-gray-700 hover:border-purple-500/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex flex-col gap-1">
                        <span className="text-purple-300 text-sm font-semibold uppercase tracking-wide pt-5">{group.subjectName}</span>
                        <span>{group.teacherName}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-white">
                          <Users className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="font-semibold">{group.teacherName}</p>
                            {group.teacherEmail && (
                              <p className="text-sm text-gray-400">{group.teacherEmail}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-200">{group.subjectName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-200">
                            {group.sessions.length} slot{group.sessions.length === 1 ? '' : 's'} available
                          </span>
                        </div>
                      </div>
                      
                      {primarySessionId && (
                        <Link href={`/live-session/${primarySessionId}`}>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 cursor-pointer">
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            {groupedSlots.length > 6 && (
              <div className="text-center">
                <Link href="/live-session">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg cursor-pointer">
                    View All Live Sessions
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

