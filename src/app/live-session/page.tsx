'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Users, GraduationCap, Loader2, XCircle, Calendar, Clock, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useLiveSessions } from '@/hooks/live-session/use-live-session'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const formatDateTime = (dateString?: string, timeString?: string, fromDate?: string, toDate?: string) => {
  let dateLabel = 'Date TBD'
  let timeLabel = timeString || 'Time TBD'

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

export default function LiveSessionPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { data: paginatedData, isLoading, error } = useLiveSessions(currentPage)

  const slots = paginatedData?.data || []
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <AppHeader/>
      <section className="py-16 bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-purple-600/20 text-purple-300 border border-purple-600/40 mb-4">Live Sessions</Badge>
            <h1 className="text-4xl font-bold text-white mb-3">Book a Live Session with Expert Mentors</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Explore upcoming live sessions hosted by our verified instructors. Reserve your seat to get personal guidance in real time.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-gray-300">
                {error instanceof Error ? error.message : 'Unable to load live sessions right now. Please try again later.'}
              </p>
            </div>
          ) : sortedSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
              <GraduationCap className="h-12 w-12 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">No live sessions available</h2>
              <p className="text-gray-400 max-w-md">
                Check back soon—mentors constantly add new live sessions to the schedule.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedSlots.map((session) => {
                  const { dateLabel, timeLabel } = formatDateTime(session.date, session.time, session.from_date, session.to_date)
                  
                  return (
                    <Link
                      key={session.id}
                      href={`/live-session/${session.id}`}
                      className="group relative block border border-gray-700 bg-gray-800/80 rounded-xl p-5 space-y-4 transition-all duration-300 ease-out hover:border-purple-500/70 hover:bg-gray-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-white leading-tight">
                          {session.teacher?.name || 'Unknown Instructor'}
                        </p>
                        <p className="text-base text-gray-300">
                          {session.subject?.name || 'General Subject'}
                        </p>
                      </div>
                      
                      {session.title && (
                        <div>
                          <p className="text-sm font-medium text-purple-300">{session.title}</p>
                        </div>
                      )}
                      
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
              
              {/* Pagination */}
              {pagination && (
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
      <Footer/>
    </div>
  )
}
