'use client'

import { useMemo, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, Users, DollarSign, Info, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLiveSessionDetail } from '@/hooks/live-session/use-live-session-detail'
import { useBookingIntent } from '@/hooks/slots/use-bookings-intent'
import { useToast } from '@/components/ui/toast'

const toDateOnlyKey = (date: Date | string | null | undefined) => {
  if (!date) {
    return null
  }
  const parsed = typeof date === 'string' ? new Date(date) : date
  if (!parsed || !(parsed instanceof Date) || Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed.toISOString().split('T')[0]
}

const formatReadableDate = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

const formatTimeRange = (start: string, end: string) => {
  const formatTime = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return value
    }
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(1970, 0, 1, hours, minutes))
  }

  return `${formatTime(start)} - ${formatTime(end)}`
}

interface CalendarCell {
  date: Date
  isCurrentMonth: boolean
}

const buildCalendarGrid = (monthDate: Date): CalendarCell[] => {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startingWeekday = firstDayOfMonth.getDay() // 0 (Sun) - 6 (Sat)
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()

  const cells: CalendarCell[] = []

  const prevMonthDays = startingWeekday
  const prevMonthLastDate = new Date(year, month, 0).getDate()
  for (let i = prevMonthDays - 1; i >= 0; i -= 1) {
    cells.push({
      date: new Date(year, month - 1, prevMonthLastDate - i),
      isCurrentMonth: false,
    })
  }

  for (let day = 1; day <= daysInCurrentMonth; day += 1) {
    cells.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    })
  }

  while (cells.length < 42) {
    const lastCellDate = cells[cells.length - 1]?.date ?? new Date(year, month, daysInCurrentMonth)
    cells.push({
      date: new Date(lastCellDate.getFullYear(), lastCellDate.getMonth(), lastCellDate.getDate() + 1),
      isCurrentMonth: false,
    })
  }

  return cells
}

export default function LiveSessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = useMemo(() => {
    const rawId = Array.isArray(params?.id) ? params?.id[0] : params?.id
    const parsed = Number(rawId)
    return Number.isFinite(parsed) ? parsed : NaN
  }, [params])

  const { data, isLoading, error } = useLiveSessionDetail(sessionId)
  const bookingIntentMutation = useBookingIntent()
  const { addToast } = useToast()

  const availableDates = useMemo(() => {
    if (!data || !data.from_date || !data.to_date) {
      return [] as Date[]
    }
    
    const fromDate = new Date(data.from_date)
    const toDate = new Date(data.to_date)
    const dates: Date[] = []
    
    if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime())) {
      const current = new Date(fromDate)
      while (current <= toDate) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
    }
    
    return dates
  }, [data])

  const [currentMonth, setCurrentMonth] = useState(() => {
    return availableDates[0] ? new Date(availableDates[0].getFullYear(), availableDates[0].getMonth(), 1) : new Date()
  })

  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    return availableDates[0] ? toDateOnlyKey(availableDates[0]) : toDateOnlyKey(new Date())
  })

  const availableDateKeys = useMemo(() => new Set(availableDates.map((date) => toDateOnlyKey(date)).filter((key): key is string => Boolean(key))), [availableDates])

  useEffect(() => {
    if (availableDates.length > 0) {
      const firstKey = toDateOnlyKey(availableDates[0])
      if (firstKey) {
        setSelectedDateKey(firstKey)
        setCurrentMonth(new Date(availableDates[0].getFullYear(), availableDates[0].getMonth(), 1))
      }
    }
  }, [availableDates])

  const selectedDate = useMemo(() => {
    if (!selectedDateKey) {
      return null
    }
    return new Date(selectedDateKey)
  }, [selectedDateKey])

  const calendarCells = useMemo(() => buildCalendarGrid(currentMonth), [currentMonth])

  const showTimeSlot = useMemo(() => {
    if (!data || !selectedDateKey) {
      return false
    }
    
    // Check if selected date is within the date range
    if (data.from_date && data.to_date) {
      const fromKey = toDateOnlyKey(data.from_date)
      const toKey = toDateOnlyKey(data.to_date)
      if (fromKey && toKey) {
        return selectedDateKey >= fromKey && selectedDateKey <= toKey
      }
    }
    
    return false
  }, [data, selectedDateKey])

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleDateSelect = (date: Date) => {
    const key = toDateOnlyKey(date)
    if (!key) {
      return
    }
    if (!availableDateKeys.has(key)) {
      return
    }
    setSelectedDateKey(key)
  }

  const handleReserveSlot = async () => {
    if (!data || !selectedDate) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Please select a date to reserve the slot.',
        duration: 5000,
      })
      return
    }

    if (data.available_seats === 0) {
      addToast({
        type: 'error',
        title: 'Slot Full',
        description: 'This slot is already full. Please select another date.',
        duration: 5000,
      })
      return
    }

    try {
      const result = await bookingIntentMutation.mutateAsync({
        slot_id: data.id,
        scheduled_date: selectedDate,
      })

      // Check if payment is required
      if (result?.requires_payment && result?.client_secret) {
        // Build URL with payment data as query parameters
        const paymentParams = new URLSearchParams({
          client_secret: result.client_secret,
          amount: String(result.amount),
          payment_intent: result.payment_intent_id || '',
        })
        
        // Add slot info if available (URLSearchParams handles encoding automatically)
        if (result.slot) {
          paymentParams.set('slot', JSON.stringify(result.slot))
        }
        
        // Redirect to payment page with URL parameters
        router.push(`/payment?${paymentParams.toString()}`)
      } else {
        // No payment required, show success message
        addToast({
          type: 'success',
          title: 'Slot Reserved',
          description: result?.message || 'Your slot reservation has been submitted successfully!',
          duration: 5000,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reserve slot. Please try again.'
      addToast({
        type: 'error',
        title: 'Reservation Failed',
        description: errorMessage,
        duration: 6000,
      })
    }
  }

  return (
    <div>
      <AppHeader />
      <main className="bg-gray-900 min-h-screen py-14">
        <div className="max-w-5xl mx-auto px-4">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-gray-800/70 mb-6 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to live sessions
          </Button>

          {isLoading ? (
            <Card className="bg-gray-800/80 border border-gray-700">
              <CardContent className="py-16 flex justify-center">
                <Calendar className="h-10 w-10 text-purple-500 animate-pulse" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-red-900/20 border border-red-700/60 text-center">
              <CardContent className="py-16 space-y-3">
                <Info className="h-10 w-10 text-red-400 mx-auto" />
                <p className="text-red-200/90">
                  {error instanceof Error ? error.message : 'Unable to load the live session right now.'}
                </p>
                <Button onClick={() => router.back()} variant="outline" className="border-red-400 text-red-200 hover:bg-red-400/20">
                  Go back
                </Button>
              </CardContent>
            </Card>
          ) : !data ? (
            <Card className="bg-gray-800/80 border border-gray-700 text-center">
              <CardContent className="py-16 space-y-3">
                <Info className="h-10 w-10 text-gray-400 mx-auto" />
                <p className="text-gray-300">Live session not found.</p>
                <Button onClick={() => router.push('/live-session')} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Browse live sessions
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <Card className="bg-gray-800/80 border border-gray-700">
                <CardHeader className="border-b border-gray-700/70 pb-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 pt-5">
                    <div>
                      <Badge className="bg-purple-600/20 text-purple-300 border border-purple-600/40 mb-2">
                        {data.type === 'one_to_one' ? 'One-to-One Session' : (data.type ?? 'Live Session')}
                      </Badge>
                      <CardTitle className="text-3xl text-white">
                        {data.title || data.teacher?.name || 'Expert Mentor'}
                      </CardTitle>
                      <p className="text-gray-300 mt-2 max-w-xl">
                        {data.description || 'Connect live with the mentor for personalized guidance and actionable feedback during this session.'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {data.price ? `$${Number(data.price).toFixed(2)}` : 'Free'}
                      </div>
                      <div className="text-sm text-gray-400">per session</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">Select a date</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={handlePrevMonth}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span>{new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(currentMonth)}</span>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={handleNextMonth}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-400 mb-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {calendarCells.map(({ date, isCurrentMonth }) => {
                        const key = toDateOnlyKey(date)
                        const isAvailable = key ? availableDateKeys.has(key) : false
                        const isSelected = key === selectedDateKey

                        return (
                          <button
                            key={`${date.toISOString()}-${isCurrentMonth}`}
                            onClick={() => handleDateSelect(date)}
                            className={`relative flex h-12 items-center justify-center rounded-md border text-sm transition-colors ${
                              isSelected
                                ? 'border-purple-500 bg-purple-600/20 text-white shadow-inner'
                                : isAvailable
                                ? 'border-purple-500/40 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20'
                                : isCurrentMonth
                                ? 'border-gray-700 bg-gray-800 text-gray-400 cursor-not-allowed'
                                : 'border-gray-800 bg-gray-900 text-gray-700 cursor-not-allowed'
                            }`}
                            disabled={!isAvailable}
                          >
                            {date.getDate()}
                            {isAvailable && !isSelected && (
                              <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-purple-400" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-4 text-sm text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-purple-500"></span>
                        <span>Available date</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-gray-500"></span>
                        <span>Unavailable</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-3">Time slot</h2>
                      {selectedDate && showTimeSlot ? (
                        <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3">
                          <div className="flex items-center gap-3 text-white">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <div className="flex flex-col">
                              <span>{data.start_time && data.end_time ? formatTimeRange(data.start_time, data.end_time) : 'Time TBD'}</span>
                              {data.available_seats > 0 && (
                                <span className="text-xs text-gray-400">
                                  {data.available_seats} {data.available_seats === 1 ? 'seat' : 'seats'} available
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                            disabled={data.available_seats === 0 || bookingIntentMutation.isPending}
                            onClick={handleReserveSlot}
                          >
                            {bookingIntentMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Reserving...
                              </>
                            ) : data.available_seats === 0 ? (
                              'Full'
                            ) : (
                              'Reserve Slot'
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-6 text-center text-gray-400">
                          Pick an available date to view the time slot.
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-5 space-y-3 text-sm text-gray-300">
                      <div className="flex items-center gap-2 text-white">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>Teacher</span>
                      </div>
                      <div className="pl-6">
                        <p className="font-medium text-white">{data.teacher?.name ?? 'Mashter'}</p>
                        {data.teacher?.email && <p className="text-gray-400">{data.teacher.email}</p>}
                      </div>
                      {data.subject && (
                        <>
                          <div className="flex items-center gap-2 text-white pt-2">
                            <Info className="w-4 h-4 text-blue-400" />
                            <span>Subject</span>
                          </div>
                          <div className="pl-6 text-gray-200">{data.subject.name}</div>
                        </>
                      )}
                      <div className="flex items-center gap-2 text-white pt-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span>Price</span>
                      </div>
                      <div className="pl-6 text-gray-200">
                        {data.price ? `$${Number(data.price).toFixed(2)}` : 'Free'}
                      </div>
                      {data.type && (
                        <div className="flex items-center gap-2 text-white pt-2">
                          <Info className="w-4 h-4 text-blue-400" />
                          <span>Session Type</span>
                        </div>
                      )}
                      {data.type && (
                        <div className="pl-6 text-gray-200 capitalize">{data.type.replace(/_/g, ' ')}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
