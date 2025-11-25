'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, Clock, DollarSign, Loader2, XCircle, ArrowRight, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLiveSessions } from '@/hooks/live-session/use-live-session'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface LiveSessionsProps {
  limit?: number
  showPagination?: boolean
  showHeader?: boolean
  showShowMore?: boolean
}

const formatDateTime = (dateString?: string, timeString?: string, fromDate?: string, toDate?: string, startTime?: string, endTime?: string) => {
  let dateLabel = 'Date TBD'
  let timeLabel = 'Time TBD'

  // Format time from start_time and end_time if available
  if (startTime && endTime) {
    try {
      const start = new Date(`1970-01-01T${startTime}`)
      const end = new Date(`1970-01-01T${endTime}`)
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        const startFormatted = start.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
        const endFormatted = end.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
        timeLabel = `${startFormatted} - ${endFormatted}`
      }
    } catch (error) {
      // Keep default
    }
  } else if (timeString) {
    timeLabel = timeString
  }

  if (fromDate && toDate) {
    try {
      const from = new Date(fromDate)
      const to = new Date(toDate)
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
        const fromFormatted = from.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        const toFormatted = to.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        dateLabel = fromFormatted === toFormatted ? fromFormatted : `${fromFormatted} - ${toFormatted}`
      }
    } catch (error) {
      // Keep default
    }
  } else if (dateString) {
    try {
      const parsed = new Date(dateString)
      if (!Number.isNaN(parsed.getTime())) {
        dateLabel = parsed.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      }
    } catch (error) {
      dateLabel = dateString
    }
  }

  return { dateLabel, timeLabel }
}

export default function LiveSessions({ 
  limit, 
  showPagination = false, 
  showHeader = true,
  showShowMore = false 
}: LiveSessionsProps = {}) {
  const [currentPage, setCurrentPage] = useState(1)
  const { data: paginatedData, isLoading, error } = useLiveSessions(currentPage)

  const slots = useMemo(() => paginatedData?.data || [], [paginatedData?.data])

  const pagination = paginatedData ? {
    currentPage: paginatedData.current_page,
    lastPage: paginatedData.last_page,
    total: paginatedData.total,
    from: paginatedData.from,
    to: paginatedData.to,
    hasNextPage: paginatedData.next_page_url !== null,
    hasPrevPage: paginatedData.prev_page_url !== null,
  } : null

  const sortedSlots = useMemo(() => {
    return [...slots].sort((a, b) => {
      const dateA = a.from_date ? new Date(a.from_date).getTime() : (a.date ? new Date(a.date).getTime() : 0)
      const dateB = b.from_date ? new Date(b.from_date).getTime() : (b.date ? new Date(b.date).getTime() : 0)
      if (dateA !== dateB) {
        return dateA - dateB
      }
      return a.id - b.id
    })
  }, [slots])

  const displaySlots = limit ? sortedSlots.slice(0, limit) : sortedSlots
  const hasMoreSlots = limit ? sortedSlots.length > limit : false

  // Remove debug logging in production
  // if (typeof window !== 'undefined') {
  //   console.log('LiveSessions Debug:', { 
  //     isLoading, 
  //     error, 
  //     paginatedData, 
  //     slotsCount: slots.length,
  //     slots: slots.slice(0, 2)
  //   })
  // }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className={showPagination ? "py-16 bg-gray-900 min-h-screen" : "py-20 bg-gray-900"}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {showHeader && (
          <div className="text-center mb-12">
            {showPagination ? (
              <>
                <Badge className="bg-purple-600/20 text-purple-300 border border-purple-600/40 mb-4">Live Sessions</Badge>
                <h1 className="text-4xl font-bold text-white mb-3">Book a Live Session with Expert Masters</h1>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Explore upcoming live sessions hosted by our verified instructors. Reserve your seat to get personal guidance in real time.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-medium">Live Sessions</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Book a Live Session with Expert Mentors</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Explore upcoming live sessions hosted by our verified instructors. Reserve your seat to get personal guidance in real time.
                </p>
              </>
            )}
          </div>
        )}

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
            {showPagination ? (
              <GraduationCap className="h-12 w-12 text-purple-400" />
            ) : (
              <Users className="h-12 w-12 text-purple-400" />
            )}
            <h3 className="text-xl font-semibold text-white">No live sessions available</h3>
            <p className="text-gray-400 max-w-md">
              Check back soon—mentors constantly add new live sessions to the schedule.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {displaySlots.map((session) => {
                const { dateLabel, timeLabel } = formatDateTime(
                  session.date, 
                  session.time, 
                  session.from_date, 
                  session.to_date,
                  (session as any).start_time,
                  (session as any).end_time
                )
                
                return (
                  <Link
                    key={session.id}
                    href={`/live-session/${session.id}`}
                    className="group relative block border border-gray-700 bg-gray-800/80 rounded-xl p-5 space-y-4 transition-all duration-300 ease-out hover:border-purple-500/70 hover:bg-gray-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    {/* Title and Master Name Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Main Title */}
                        <h3 className="text-lg font-semibold text-white leading-tight">
                          {session.title || 'Live Session'}
                        </h3>
                        {/* Category after title */}
                        <p className="text-sm text-purple-300 font-medium">
                          {session.subject?.name || 'General Subject'}
                        </p>
                      </div>
                      {/* Master Name on Right */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-300">
                          {session.teacher?.name || 'Unknown Master'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {session.type && (
                        <Badge className="bg-purple-600/20 text-purple-300 border border-purple-600/40 text-xs">
                          {session.type === 'one_to_one' ? 'One-to-One' : session.type.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-base text-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>{dateLabel}</span>
                      </div>
                      {timeLabel && timeLabel !== 'Time TBD' && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span>{timeLabel}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                      {session.available_seats !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>{session.available_seats} seat{session.available_seats === 1 ? '' : 's'} available</span>
                        </div>
                      )}
                      {session.price && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                          <DollarSign className="w-4 h-4" />
                          <span>${Number(session.price).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
            
            {hasMoreSlots && showShowMore && (
              <div className="text-center">
                <Link href="/live-session">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg cursor-pointer">
                    Show More
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Pagination */}
            {showPagination && pagination && (
              <div className="mt-12 border-t border-gray-700 pt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div className="text-sm text-gray-400">
                    {pagination.from && pagination.to ? (
                      <>Showing <span className="text-white font-medium">{pagination.from}</span> to <span className="text-white font-medium">{pagination.to}</span> of <span className="text-white font-medium">{pagination.total}</span> results</>
                    ) : (
                      <>Total: <span className="text-white font-medium">{pagination.total}</span> results</>
                    )}
                  </div>
                </div>
                
                {pagination.lastPage > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (pagination.hasPrevPage && !isLoading) {
                              handlePageChange(currentPage - 1)
                            }
                          }}
                          className={!pagination.hasPrevPage || isLoading ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = 
                          page === 1 ||
                          page === pagination.lastPage ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        
                        if (!showPage) {
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                          }
                          return null
                        }
                        
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (!isLoading) {
                                  handlePageChange(page)
                                }
                              }}
                              isActive={page === currentPage}
                              className={isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (pagination.hasNextPage && !isLoading) {
                              handlePageChange(currentPage + 1)
                            }
                          }}
                          className={!pagination.hasNextPage || isLoading ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

