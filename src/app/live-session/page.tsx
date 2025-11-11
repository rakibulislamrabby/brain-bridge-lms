'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { CalendarDays, Clock, Users, GraduationCap, Loader2, XCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLiveSessions } from '@/hooks/live-session/use-live-session'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'

const formatDate = (isoDate: string) => {
  try {
    const parsed = new Date(isoDate)
    if (Number.isNaN(parsed.getTime())) {
      return isoDate
    }
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(parsed)
  } catch (error) {
    return isoDate
  }
}

const buildGroupKey = (teacherId?: number, subjectId?: number) => {
  return `${teacherId ?? 'unknown'}-${subjectId ?? 'unknown'}`
}

export default function LiveSessionPage() {
  const { data: slots = [], isLoading, error } = useLiveSessions()

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
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        if (dateA !== dateB) {
          return dateA - dateB
        }
        return a.time.localeCompare(b.time)
      }),
    }))
  }, [slots])

  return (
    <div>
        <AppHeader/>
        <section className="py-16 bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-purple-600/20 text-purple-300 border border-purple-600/40 mb-4">Live Sessions</Badge>
          <h1 className="text-4xl font-bold text-white mb-3">Book a Live Session with Expert Mentors</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore upcoming live sessions hosted by our verified instructors. Reserve your seat to get personal guidance in real time.
          </p>
        </div>

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
        ) : groupedSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <GraduationCap className="h-12 w-12 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">No live sessions available</h2>
            <p className="text-gray-400 max-w-md">
              Check back soon—mentors constantly add new live sessions to the schedule.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedSlots.map((group, index) => {
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
                    {group.sessions.map((session) => (
                      <div key={session.id} className="rounded-lg bg-gray-900/40 border border-gray-700/60 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-purple-400" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>{session.available_seats} seat{session.available_seats === 1 ? '' : 's'} left</span>
                        </div>
                      </div>
                    ))}
                    {group.teacherEmail && (
                      <div className="text-sm text-gray-400">
                        Contact: <span className="text-gray-200">{group.teacherEmail}</span>
                      </div>
                    )}
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
        )}
      </div>
    </section>
        <Footer/>
    </div>
  )
}
