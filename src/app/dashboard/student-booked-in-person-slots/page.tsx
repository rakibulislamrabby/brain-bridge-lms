'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStoredUser } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStudentBookedInPersonSlots } from '@/hooks/student/use-booked-in-person-slots'
import { 
  Calendar, 
  Loader2, 
  Clock,
  MapPin,
  User,
  RefreshCw,
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

export default function StudentBookedInPersonSlotsPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { addToast } = useToast()
  
  const { data: paginatedData, isLoading, error, refetch } = useStudentBookedInPersonSlots(currentPage)
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

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return '—'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '—'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount)
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
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

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
                <Link href="/courses">
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
                          Teacher
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Subject
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Scheduled Date
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Price
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookedSlots.map((booking) => {
                        const slot = booking.slot
                        return (
                          <tr
                            key={booking.id}
                            className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="text-white font-medium">{slot?.title || 'In-Person Session'}</div>
                              <div className="text-xs text-gray-400 mt-1">ID: {booking.slot_id}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-orange-400" />
                                <div>
                                  <div className="text-white text-sm">{slot?.teacher?.name || '—'}</div>
                                  {slot?.teacher?.email && (
                                    <div className="text-xs text-gray-400">{slot.teacher.email}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                {slot?.subject?.name || '—'}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 text-gray-300 text-sm">
                                <Calendar className="w-4 h-4 text-orange-400" />
                                {formatDate(booking.scheduled_date)}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-300 text-sm">
                              {formatCurrency(slot?.price)}
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(booking.status)}
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
                          const showPage =
                            page === 1 ||
                            page === pagination.lastPage ||
                            (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)

                          if (!showPage) {
                            if (
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
                            onClick={() => {
                              if (pagination.hasNextPage && !isLoading) {
                                handlePageChange(currentPage + 1)
                              }
                            }}
                            className={
                              !pagination.hasNextPage || isLoading
                                ? 'pointer-events-none opacity-50 cursor-not-allowed'
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

