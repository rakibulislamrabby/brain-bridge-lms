'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStoredUser } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStudentBookedSlots } from '@/hooks/student/use-booked-slots'
import { 
  Calendar, 
  Loader2, 
  Clock,
  Video,
  User,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function StudentBookedSlotsPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { addToast } = useToast()
  
  const { data: paginatedData, isLoading, error, refetch } = useStudentBookedSlots(currentPage)
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

  useEffect(() => {
    if (error) {
      addToast({
        type: 'error',
        title: 'Failed to Load Bookings',
        description: error instanceof Error ? error.message : 'Unable to fetch booked slots. Please try again.',
        duration: 5000,
      })
    }
  }, [error, addToast])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date)
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch {
      return dateString
    }
  }

  const formatTime = (value?: string) => {
    if (!value) return '—'
    try {
      const date = new Date(`1970-01-01T${value}`)
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch (error) {
      return value
    }
  }

  const formatCurrency = (amount: string | number | null | undefined, currency: string = 'usd') => {
    if (!amount) return '—'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '—'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(numAmount)
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
              <Calendar className="h-8 w-8 text-orange-500" />
              My Booked Slots
            </h1>
            <p className="text-gray-400 mt-2">
              View all your scheduled live session bookings
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

        {/* Bookings Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <Video className="h-5 w-5 text-orange-500" />
              Booked Sessions
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
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No bookings yet</p>
                <p className="text-sm mb-4">Start exploring live sessions to book a slot!</p>
                <Link href="/live-session">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Browse Sessions
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
                          Slot
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Subject
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Teacher
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
                          Meeting Link
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookedSlots.map((booking) => {
                        const slot = booking.slot
                        
                        // Parse scheduled_start_time and scheduled_end_time
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
                        
                        const startDateTime = parseDateTime(booking.scheduled_start_time)
                        const endDateTime = parseDateTime(booking.scheduled_end_time)
                        
                        return (
                          <tr
                            key={booking.id}
                            className="border-t border-gray-700/60 hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <p className="text-sm font-semibold text-white">
                                {slot.title || 'Untitled Slot'}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-300">
                              {slot.subject?.name || '—'}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-300">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-purple-400" />
                                <span>{slot.teacher?.name || '—'}</span>
                              </div>
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
                              {booking.meeting_link ? (
                                <a
                                  href={booking.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                                >
                                  <Video className="h-4 w-4" />
                                  Join
                                </a>
                              ) : (
                                <span className="text-gray-500 text-sm">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.lastPage > 1 && (
                  <div className="p-4 border-t border-gray-700">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => {
                              if (pagination.hasPrevPage) {
                                handlePageChange(pagination.currentPage - 1)
                              }
                            }}
                            className={
                              !pagination.hasPrevPage
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>

                        {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === pagination.lastPage ||
                            (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={page === pagination.currentPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          } else if (
                            page === pagination.currentPage - 2 ||
                            page === pagination.currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                          }
                          return null
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => {
                              if (pagination.hasNextPage) {
                                handlePageChange(pagination.currentPage + 1)
                              }
                            }}
                            className={
                              !pagination.hasNextPage
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
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

