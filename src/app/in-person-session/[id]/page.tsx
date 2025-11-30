'use client'

import { useMemo, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, Users, DollarSign, Info, ChevronLeft, ChevronRight, Loader2, MapPin } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useInPersonSlotDetail } from '@/hooks/live-session/use-in-person-slot-detail'
import { useInPersonBookingIntent } from '@/hooks/slots/use-in-person-booking-intent'
import { useToast } from '@/components/ui/toast'
import { useMe } from '@/hooks/use-me'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Minus } from 'lucide-react'

const toDateOnlyKey = (date: Date | string | null | undefined) => {
  if (!date) {
    return null
  }
  const parsed = typeof date === 'string' ? new Date(date) : date
  if (!parsed || !(parsed instanceof Date) || Number.isNaN(parsed.getTime())) {
    return null
  }
  // Use local date to avoid timezone issues
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

export default function InPersonSessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = useMemo(() => {
    const rawId = Array.isArray(params?.id) ? params?.id[0] : params?.id
    const parsed = Number(rawId)
    return Number.isFinite(parsed) ? parsed : NaN
  }, [params])

  const { data, isLoading, error } = useInPersonSlotDetail(sessionId)
  const bookingIntentMutation = useInPersonBookingIntent()
  const { addToast } = useToast()
  const { data: userData } = useMe()
  const [pointsToUse, setPointsToUse] = useState<number>(0)

  // Calculate available dates based on daily_available_seats
  const availableDates = useMemo(() => {
    if (!data || !data.from_date || !data.to_date) {
      return [] as Date[]
    }
    
    // Parse dates and normalize to local midnight to avoid timezone issues
    const parseDate = (dateString: string): Date | null => {
      try {
        const date = new Date(dateString)
        if (Number.isNaN(date.getTime())) {
          return null
        }
        // Create a new date using local date components to avoid timezone shifts
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
      } catch {
        return null
      }
    }
    
    const fromDate = parseDate(data.from_date)
    const toDate = parseDate(data.to_date)
    
    if (!fromDate || !toDate) {
      return [] as Date[]
    }
    
    const dates: Date[] = []
    
    // Get today's date at midnight (local time)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Start from the later of: fromDate or today (to include today if it's in range)
    const startDate = fromDate < today ? new Date(today) : new Date(fromDate)
    const endDate = new Date(toDate)
    
    // Only proceed if start date is not after end date
    if (startDate <= endDate) {
      const current = new Date(startDate)
      while (current <= endDate) {
        // Only include dates that are today or in the future
        const dateToCheck = new Date(current)
        dateToCheck.setHours(0, 0, 0, 0)
        
        if (dateToCheck >= today) {
          const dateKey = toDateOnlyKey(current)
          if (dateKey && data.daily_available_seats[dateKey]) {
            // Include date if it has availability data
            dates.push(new Date(current))
          }
        }
        current.setDate(current.getDate() + 1)
      }
    }
    
    return dates
  }, [data])

  const [currentMonth, setCurrentMonth] = useState(() => {
    return availableDates[0] ? new Date(availableDates[0].getFullYear(), availableDates[0].getMonth(), 1) : new Date()
  })

  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    // Find the first available date that is today or in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const firstFutureDate = availableDates.find(date => {
      const dateToCheck = new Date(date)
      dateToCheck.setHours(0, 0, 0, 0)
      return dateToCheck >= today
    })
    
    return firstFutureDate ? toDateOnlyKey(firstFutureDate) : null
  })

  const availableDateKeys = useMemo(() => {
    const keys = new Set<string>()
    if (data?.daily_available_seats) {
      Object.keys(data.daily_available_seats).forEach(key => {
        // Exclude dates that are in booked_slots
        const isBooked = data.booked_slots?.some(booked => {
          const bookedDateKey = toDateOnlyKey(booked.scheduled_date)
          return bookedDateKey === key
        })
        if (!isBooked) {
          keys.add(key)
        }
      })
    }
    return keys
  }, [data])

  useEffect(() => {
    if (availableDates.length > 0) {
      // Find the first future date (availableDates is already filtered to exclude past dates)
      const firstFutureDate = availableDates[0]
      const firstKey = toDateOnlyKey(firstFutureDate)
      if (firstKey && availableDateKeys.has(firstKey)) {
        setSelectedDateKey(firstKey)
        setCurrentMonth(new Date(firstFutureDate.getFullYear(), firstFutureDate.getMonth(), 1))
      }
    } else {
      // If no available dates, set current month to today
      const today = new Date()
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    }
  }, [availableDates, availableDateKeys])

  const selectedDate = useMemo(() => {
    if (!selectedDateKey) {
      return null
    }
    return new Date(selectedDateKey)
  }, [selectedDateKey])

  // Check if a date is full (booked) - must be after selectedDateKey is initialized
  const isDateFull = useMemo(() => {
    if (!data || !selectedDateKey) return true
    const dayData = data.daily_available_seats[selectedDateKey]
    if (!dayData) return true // If no data, consider it full
    
    // Check if this date is in booked_slots
    const isBooked = data.booked_slots?.some(booked => {
      const bookedDateKey = toDateOnlyKey(booked.scheduled_date)
      return bookedDateKey === selectedDateKey
    }) || false
    
    return isBooked
  }, [data, selectedDateKey])

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
        return selectedDateKey >= fromKey && selectedDateKey <= toKey && availableDateKeys.has(selectedDateKey)
      }
    }
    
    return false
  }, [data, selectedDateKey, availableDateKeys])

  // Points system calculations
  const availablePoints = userData?.points || 0
  const slotPrice = Number(data?.price) || 0
  const pointsDiscount = Math.min(pointsToUse, slotPrice, availablePoints) // 1 point = $1
  const finalAmount = Math.max(0, slotPrice - pointsDiscount)

  const handlePointsChange = (value: string) => {
    const numValue = parseInt(value) || 0
    const maxPoints = Math.min(availablePoints, Math.floor(slotPrice))
    setPointsToUse(Math.max(0, Math.min(numValue, maxPoints)))
  }

  const handleMaxPoints = () => {
    const maxPoints = Math.min(availablePoints, Math.floor(slotPrice))
    setPointsToUse(maxPoints)
  }

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
    
    // Check if date is in the past (today is allowed)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateToCheck = new Date(date)
    dateToCheck.setHours(0, 0, 0, 0)
    
    // Only block dates that are strictly before today (today >= today, so today is allowed)
    if (dateToCheck < today) {
      return // Don't allow selecting past dates (but today is allowed)
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

    if (isDateFull) {
      addToast({
        type: 'error',
        title: 'Reservation Failed',
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
        
        // Add points to use if any
        if (pointsToUse > 0) {
          paymentParams.set('points_to_use', String(pointsToUse))
        }
        
        // Add slot type to identify in-person slots
        paymentParams.set('slot_type', 'in-person')
        
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
            Back to in-person sessions
          </Button>

          {isLoading ? (
            <Card className="bg-gray-800/80 border border-gray-700">
              <CardContent className="py-16 flex justify-center">
                <Calendar className="h-10 w-10 text-orange-500 animate-pulse" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-red-900/20 border border-red-700/60 text-center">
              <CardContent className="py-16 space-y-3">
                <Info className="h-10 w-10 text-red-400 mx-auto" />
                <p className="text-red-200/90">
                  {error instanceof Error ? error.message : 'Unable to load the in-person session right now.'}
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
                <p className="text-gray-300">In-person session not found.</p>
                <Button onClick={() => router.push('/courses')} className="bg-orange-600 hover:bg-orange-700 text-white">
                  Browse in-person sessions
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <Card className="bg-gray-800/80 border border-gray-700">
                <CardHeader className="border-b border-gray-700/70 pb-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 pt-5">
                    <div>
                      <Badge className="bg-orange-600/20 text-orange-300 border border-orange-600/40 mb-2">
                        In-Person Session
                      </Badge>
                      <CardTitle className="text-3xl text-white">
                        {data.title || data.teacher?.name || 'Expert Mentor'}
                      </CardTitle>
                      <p className="text-gray-300 mt-2 max-w-xl">
                        {data.description || 'Join the mentor for an in-person learning experience with hands-on guidance and personalized feedback.'}
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
                        
                        // Check if date is in the past (today is allowed)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const dateToCheck = new Date(date)
                        dateToCheck.setHours(0, 0, 0, 0)
                        // Only block dates that are strictly before today (today >= today, so today is allowed)
                        const isPastDate = dateToCheck < today
                        const isDisabled = !isAvailable || isPastDate

                        return (
                          <button
                            key={`${date.toISOString()}-${isCurrentMonth}`}
                            onClick={() => handleDateSelect(date)}
                            className={`relative flex h-12 items-center justify-center rounded-md border text-sm transition-colors ${
                              isSelected
                                ? 'border-orange-500 bg-orange-600/20 text-white shadow-inner'
                                : isAvailable && !isPastDate
                                ? 'border-orange-500/40 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20'
                                : isCurrentMonth
                                ? 'border-gray-700 bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                                : 'border-gray-800 bg-gray-900 text-gray-700 cursor-not-allowed opacity-50'
                            }`}
                            disabled={isDisabled}
                            title={isPastDate ? 'Past dates cannot be selected' : undefined}
                          >
                            {date.getDate()}
                            {isAvailable && !isSelected && !isPastDate && (
                              <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-orange-400" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-4 text-sm text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-orange-500"></span>
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
                        <div className="space-y-4">
                          <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3">
                            <div className="flex items-center gap-3 text-white">
                              <Clock className="w-4 h-4 text-orange-400" />
                              <div className="flex flex-col">
                                <span>{data.start_time && data.end_time ? formatTimeRange(data.start_time, data.end_time) : 'Time TBD'}</span>
                                {!isDateFull && (
                                  <span className="text-xs text-gray-400">
                                    Available
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Points Usage Section */}
                          {!isDateFull && slotPrice > 0 && (
                            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-white flex items-center gap-2 text-sm">
                                  <Sparkles className="w-4 h-4 text-yellow-400" />
                                  Use Points (1 point = $1 discount)
                                </Label>
                                <span className="text-xs text-gray-400">
                                  Available: <span className="text-yellow-400 font-semibold">{availablePoints}</span> points
                                </span>
                              </div>
                              
                              {availablePoints > 0 ? (
                                <>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      max={Math.min(availablePoints, Math.floor(slotPrice))}
                                      value={pointsToUse || ''}
                                      onChange={(e) => handlePointsChange(e.target.value)}
                                      placeholder="0"
                                      className="bg-gray-800 border-gray-600 text-white flex-1"
                                      disabled={bookingIntentMutation.isPending}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={handleMaxPoints}
                                      className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 whitespace-nowrap text-xs px-3"
                                      disabled={bookingIntentMutation.isPending}
                                    >
                                      Use Max
                                    </Button>
                                  </div>
                                  
                                  {pointsToUse > 0 && (
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center justify-between text-gray-300">
                                          <span>Original Price:</span>
                                          <span>${slotPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-yellow-400">
                                          <span className="flex items-center gap-1">
                                            <Minus className="w-3 h-3" />
                                            Points Discount ({pointsToUse} pts):
                                          </span>
                                          <span>-${pointsDiscount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-white font-semibold pt-1 border-t border-yellow-500/20">
                                          <span>Final Amount:</span>
                                          <span>${finalAmount.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-xs text-gray-500 text-center py-2">
                                  You don't have any points available. Earn points by completing courses and sessions!
                                </p>
                              )}
                            </div>
                          )}

                          <Button 
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                            disabled={isDateFull || bookingIntentMutation.isPending}
                            onClick={handleReserveSlot}
                          >
                            {bookingIntentMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Reserving...
                              </>
                            ) : isDateFull ? (
                              'Full'
                            ) : (
                              `Reserve Slot${pointsToUse > 0 ? ` - Pay $${finalAmount.toFixed(2)}` : ''}`
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
                        <Users className="w-4 h-4 text-orange-400" />
                        <span>Teacher</span>
                      </div>
                      <div className="pl-6">
                        <p className="font-medium text-white">{data.teacher?.name ?? 'Unknown'}</p>
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
                      <div className="flex items-center gap-2 text-white pt-2">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <span>Session Type</span>
                      </div>
                      <div className="pl-6 text-gray-200">In-Person</div>
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

