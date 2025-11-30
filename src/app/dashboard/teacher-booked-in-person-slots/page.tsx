'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStoredUser } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTeacherInPersonBookedSlots } from '@/hooks/teacher/use-booked-in-person-slots'
import { 
  Calendar, 
  Loader2, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  Users,
  User,
  MapPin,
  Clock,
  XCircle,
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

export default function TeacherBookedInPersonSlotsPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { addToast } = useToast()
  
  const { data: paginatedData, isLoading, error, refetch } = useTeacherInPersonBookedSlots(currentPage)
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
        description: error instanceof Error ? error.message : 'Unable to fetch booked in-person slots. Please try again.',
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

  // Calculate summary stats
  const totalBookings = bookedSlots?.length || 0
  const totalRevenue = bookedSlots?.reduce((sum, slot) => {
    if (slot.session) {
      const amount = parseFloat(slot.session.amount_paid || '0')
      return sum + (isNaN(amount) ? 0 : amount)
    }
    return sum
  }, 0) || 0
  const activeBookings = bookedSlots?.filter(slot => slot.session && (slot.session.status === 'scheduled' || slot.session.status === 'confirmed')).length || 0
  const paidBookings = bookedSlots?.filter(slot => slot.session && slot.session.payment_status === 'paid').length || 0

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
              <MapPin className="h-8 w-8 text-orange-500" />
              Booked In-Person Slots
            </h1>
            <p className="text-gray-400 mt-2">
              View all students who have booked your in-person slots
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

        {/* Summary Stats */}
        {bookedSlots && bookedSlots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Bookings</p>
                    <p className="text-2xl font-bold text-white mt-1">{totalBookings}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Bookings</p>
                    <p className="text-2xl font-bold text-white mt-1">{activeBookings}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Paid</p>
                    <p className="text-2xl font-bold text-white mt-1">{paidBookings}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <Calendar className="h-5 w-5 text-orange-500" />
              In-Person Slot Bookings
            </CardTitle>
            <CardDescription className="text-gray-400">
              {bookedSlots && bookedSlots.length > 0
                ? `${totalBookings} booking${totalBookings !== 1 ? 's' : ''} found`
                : 'No bookings found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!bookedSlots || bookedSlots.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No in-person bookings yet</p>
                <p className="text-sm mb-4">Students will appear here once they book your in-person slots.</p>
                <Link href="/dashboard/in-person-session">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Manage In-Person Slots
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
                          Student
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
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookedSlots.map((slot) => {
                        const session = slot.session
                        if (!session) return null
                        
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
                        
                        const startDateTime = parseDateTime(session.scheduled_start_time)
                        const endDateTime = parseDateTime(session.scheduled_end_time)
                        
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
                            key={slot.id}
                            className="border-t border-gray-700/60 hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <p className="text-sm font-semibold text-white">
                                {slot.title || 'Untitled Slot'}
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
                                <span>{session.student?.name || `Student #${session.student_id}`}</span>
                              </div>
                              {session.student?.email && (
                                <p className="text-xs text-gray-400 mt-1">{session.student.email}</p>
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-300">
                              {address ? (
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
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
                              {getPaymentStatusBadge(session.payment_status)}
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(session.status)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1 text-sm font-semibold text-green-400">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatCurrency(session.amount_paid || session.price, session.currency)}</span>
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

