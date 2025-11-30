'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStoredUser } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStudentInPersonBookedSlots } from '@/hooks/student/use-booked-in-person-slots'
import { 
  Calendar, 
  Loader2, 
  Clock,
  MapPin,
  User,
  DollarSign,
  XCircle,
} from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function StudentBookedInPersonSlotsPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  
  const { data: paginatedData, isLoading, error, refetch } = useStudentInPersonBookedSlots(currentPage)
  const bookedSlots = paginatedData?.data || []

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/signin')
      return
    }
    setUser(storedUser)
    setLoading(false)
  }, [router])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return <Badge className="bg-blue-600/80 text-white">Scheduled</Badge>
      case 'completed':
        return <Badge className="bg-green-600/80 text-white">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-600/80 text-white">Cancelled</Badge>
      case 'ongoing':
        return <Badge className="bg-purple-600/80 text-white">Ongoing</Badge>
      default:
        return <Badge className="bg-gray-600/80 text-white">{status || 'Unknown'}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-600/80 text-white">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-600/80 text-white">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-600/80 text-white">Failed</Badge>
      default:
        return <Badge className="bg-gray-600/80 text-white">{status || 'Unknown'}</Badge>
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const parseDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      return {
        date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      }
    } catch {
      return { date: dateTimeStr, time: dateTimeStr }
    }
  }

  const pagination = paginatedData ? {
    currentPage: paginatedData.current_page,
    lastPage: paginatedData.last_page,
    total: paginatedData.total,
    from: paginatedData.from,
    to: paginatedData.to,
    hasNextPage: paginatedData.next_page_url !== null,
    hasPrevPage: paginatedData.prev_page_url !== null,
  } : null

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <MapPin className="h-8 w-8 text-orange-500" />
              My Booked In-Person Slots
            </h1>
            <p className="text-gray-400 mt-2">
              View all your scheduled in-person session bookings
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-900/20 border-red-700/60">
            <CardContent className="py-8 text-center">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-200">
                {error instanceof Error ? error.message : 'Failed to load booked slots'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bookings Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <MapPin className="h-5 w-5 text-orange-500" />
              Booked In-Person Sessions
            </CardTitle>
            <CardDescription className="text-gray-400">
              {paginatedData && paginatedData.total > 0
                ? `Showing ${paginatedData.from || 0} to ${paginatedData.to || 0} of ${paginatedData.total} booking${paginatedData.total !== 1 ? 's' : ''}`
                : 'No bookings found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!bookedSlots || bookedSlots.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No in-person bookings yet</p>
                <p className="text-sm mb-4">Start exploring in-person sessions to book a slot!</p>
                <Link href="/in-person-session">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Browse In-Person Sessions
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-900/60">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Session
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Subject
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Teacher
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Location
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Date & Time
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Payment Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookedSlots.map((booking) => {
                        const slot = booking.slot
                        const startDateTime = parseDateTime(booking.scheduled_start_time)
                        const endDateTime = parseDateTime(booking.scheduled_end_time)
                        
                        // Build address string
                        const addressParts = [
                          slot.area,
                          slot.city,
                          slot.state,
                          slot.country
                        ].filter(Boolean)
                        const address = addressParts.join(', ')
                        
                        return (
                          <tr
                            key={booking.id}
                            className="border-t border-gray-700/60 hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <p className="text-sm font-semibold text-white">
                                {slot.title || 'In-Person Session'}
                              </p>
                              {slot.description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                  {slot.description}
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-300">
                              {slot.subject?.name || '—'}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-300">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-orange-400" />
                                <span>{slot.teacher?.name || `Teacher #${slot.teacher_id}`}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-300">
                              {address ? (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-orange-400 flex-shrink-0" />
                                  <span className="line-clamp-2">{address}</span>
                                </div>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-300">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-green-400" />
                                  <span>{startDateTime.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-orange-400" />
                                  <span>{startDateTime.time} - {endDateTime.time}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {getPaymentStatusBadge(booking.payment_status)}
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(booking.status)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1 text-sm font-semibold text-green-400">
                                <DollarSign className="h-4 w-4" />
                                <span>${Number(booking.amount_paid || booking.price).toFixed(2)}</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.lastPage > 1 && (
                  <div className="border-t border-gray-700 pt-6 px-4 pb-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                      <div className="text-sm text-gray-400">
                        {pagination.from && pagination.to ? (
                          <>Showing <span className="text-white font-medium">{pagination.from}</span> to <span className="text-white font-medium">{pagination.to}</span> of <span className="text-white font-medium">{pagination.total}</span> results</>
                        ) : (
                          <>Total: <span className="text-white font-medium">{pagination.total}</span> results</>
                        )}
                      </div>
                    </div>
                    
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
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

