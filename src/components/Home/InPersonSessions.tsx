'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, Clock, DollarSign, Loader2, XCircle, ArrowRight, GraduationCap, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePublicInPersonSlots } from '@/hooks/live-session/use-public-in-person-slots'
import InPersonSessionPreviewModal from '@/components/shared/InPersonSessionPreviewModal'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface InPersonSessionsProps {
  limit?: number
  showPagination?: boolean
  showHeader?: boolean
  showShowMore?: boolean
}

const formatDateTime = (fromDate?: string, toDate?: string, timeString?: string) => {
  let dateLabel = 'Date TBD'
  let timeLabel = 'Time TBD'

  if (timeString) {
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
  }

  return { dateLabel, timeLabel }
}

export default function InPersonSessions({ 
  limit, 
  showPagination = false, 
  showHeader = true,
  showShowMore = false 
}: InPersonSessionsProps = {}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const { data: paginatedData, isLoading, error } = usePublicInPersonSlots(currentPage)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput)
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm])

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
      const dateA = a.from_date ? new Date(a.from_date).getTime() : 0
      const dateB = b.from_date ? new Date(b.from_date).getTime() : 0
      if (dateA !== dateB) {
        return dateA - dateB
      }
      return a.id - b.id
    })
  }, [slots])

  // Filter slots based on search term
  const filteredSlots = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return sortedSlots
    }

    const searchLower = debouncedSearchTerm.trim().toLowerCase()
    
    return sortedSlots.filter((slot) => {
      // Search in title
      const titleMatch = slot.title?.toLowerCase().includes(searchLower) || false
      
      // Search in teacher name
      const teacherMatch = slot.teacher?.name?.toLowerCase().includes(searchLower) || false
      
      // Search in subject name
      const subjectMatch = slot.subject?.name?.toLowerCase().includes(searchLower) || false
      
      // Search in city
      const cityMatch = slot.city?.toLowerCase().includes(searchLower) || false
      
      // Search in state
      const stateMatch = slot.state?.toLowerCase().includes(searchLower) || false
      
      // Search in area
      const areaMatch = slot.area?.toLowerCase().includes(searchLower) || false
      
      // Search in country
      const countryMatch = slot.country?.toLowerCase().includes(searchLower) || false
      
      return titleMatch || teacherMatch || subjectMatch || cityMatch || stateMatch || areaMatch || countryMatch
    })
  }, [sortedSlots, debouncedSearchTerm])

  const displaySlots = limit ? filteredSlots.slice(0, limit) : filteredSlots
  const hasMoreSlots = limit ? sortedSlots.length > limit : false

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className={showPagination ? " bg-gray-900 min-h-screen" : "py-20 bg-gray-900"}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {showHeader && (
          <div className="text-center mb-12">
            {showPagination ? (
              <>
                <Badge className="bg-orange-600/20 text-orange-300 border border-orange-600/40 mb-4">In-Person Sessions</Badge>
                <h1 className="text-4xl font-bold text-white mb-3">Book an In-Person Session with Expert Masters</h1>
                <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                  Explore upcoming in-person sessions hosted by our verified instructors. Reserve your seat for face-to-face learning experiences.
                </p>
                {/* Search Field */}
                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search by title, teacher, subject, or city..."
                      className="pl-10 pr-4 py-6 bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500/20 text-base"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-medium">In-Person Sessions</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Book an In-Person Session with Expert Mentors</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Explore upcoming in-person sessions hosted by our verified instructors. Reserve your seat for face-to-face learning experiences.
                </p>
              </>
            )}
          </div>
        )}

        {/* Search Field for In Person section (when header is hidden but pagination is shown) */}
        {!showHeader && showPagination && (
          <div className="text-center mb-12">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by title, teacher, subject, or city..."
                  className="pl-10 pr-4 py-6 bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500/20 text-base"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-gray-300">
              {error instanceof Error ? error.message : 'Unable to load in-person sessions right now. Please try again later.'}
            </p>
          </div>
        ) : displaySlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            {showPagination ? (
              <GraduationCap className="h-12 w-12 text-orange-400" />
            ) : (
              <MapPin className="h-12 w-12 text-orange-400" />
            )}
            <h3 className="text-xl font-semibold text-white">No in-person sessions available</h3>
            <p className="text-gray-400 max-w-md">
              Check back soon—mentors constantly add new in-person sessions to the schedule.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {displaySlots.map((session) => {
                const { dateLabel, timeLabel } = formatDateTime(
                  session.from_date,
                  session.to_date,
                  session.time
                )
                
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      setSelectedSession(session)
                      setPreviewModalOpen(true)
                    }}
                    className="group relative block border border-gray-700 bg-gray-800/80 rounded-xl p-5 space-y-4 transition-all duration-300 ease-out hover:border-orange-500/70 hover:bg-gray-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    {/* Title and Master Name Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Main Title */}
                        <h3 className="text-lg font-semibold text-white leading-tight">
                          {session.title || 'In-Person Session'}
                        </h3>
                        {/* Category after title */}
                        <p className="text-sm text-orange-300 font-medium">
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
                      <Badge className="bg-orange-600/20 text-orange-300 border border-orange-600/40 text-xs">
                        In-Person
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-base text-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <span>{dateLabel}</span>
                      </div>
                      {timeLabel && timeLabel !== 'Time TBD' && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span>{timeLabel}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Address Information */}
                    {(session.city || session.state || session.area || session.country) && (
                      <div className="flex items-start gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          {[
                            session.area,
                            session.city,
                            session.state,
                            session.country
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end pt-2 border-t border-gray-700/50">
                      {session.price && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                          <DollarSign className="w-4 h-4" />
                          <span>${Number(session.price).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* In-Person Session Preview Modal */}
            {selectedSession && (
              <InPersonSessionPreviewModal
                open={previewModalOpen}
                onOpenChange={(open) => {
                  setPreviewModalOpen(open)
                  if (!open) {
                    setTimeout(() => {
                      setSelectedSession(null)
                    }, 300)
                  }
                }}
                session={selectedSession}
              />
            )}
            
            {hasMoreSlots && showShowMore && (
              <div className="text-center">
                <Link href="/courses">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg cursor-pointer">
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
                    {debouncedSearchTerm.trim() ? (
                      <>Found <span className="text-white font-medium">{filteredSlots.length}</span> result{filteredSlots.length === 1 ? '' : 's'} for &quot;<span className="text-white font-medium">{debouncedSearchTerm}</span>&quot;</>
                    ) : pagination.from && pagination.to ? (
                      <>Showing <span className="text-white font-medium">{pagination.from}</span> to <span className="text-white font-medium">{pagination.to}</span> of <span className="text-white font-medium">{pagination.total}</span> results</>
                    ) : (
                      <>Total: <span className="text-white font-medium">{pagination.total}</span> results</>
                    )}
                  </div>
                </div>
                
                {/* Only show pagination when not searching */}
                {!debouncedSearchTerm.trim() && pagination.lastPage > 1 && (
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

