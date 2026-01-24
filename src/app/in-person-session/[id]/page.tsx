'use client'

import { useMemo, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, DollarSign, Info, ChevronLeft, ChevronRight, Loader2, MapPin, CheckCircle2, Play, Video as VideoIcon, X, Star, Award, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useInPersonSlotDetail } from '@/hooks/live-session/use-in-person-slot-detail'
import { useInPersonSchedule } from '@/hooks/live-session/use-in-person-schedule'
import { useInPersonBookingIntent } from '@/hooks/slots/use-in-person-booking-intent'
import { useTeacherDetails } from '@/hooks/teacher/use-teacher-details'
import { useToast } from '@/components/ui/toast'
import { useMe } from '@/hooks/use-me'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Minus } from 'lucide-react'
import { SERVICE_FEE } from '@/lib/constants'

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL

const resolveMediaUrl = (path?: string | null) => {
  if (!path) {
    return null
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  if (!MEDIA_BASE_URL) {
    return null
  }

  const base = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`
  
  if (path.startsWith('videos/') || path.startsWith('/videos/')) {
    const cleanedPath = path.replace(/^\/?videos\//, '').replace(/^\/+/, '')
    return `${base}storage/videos/${cleanedPath}`
  }
  
  const cleanedPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '')
  return `${base}storage/${cleanedPath}`
}

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
  const { data: scheduleData, isLoading: isScheduleLoading } = useInPersonSchedule(sessionId)
  const { data: teacherDetailsData } = useTeacherDetails(data?.teacher?.id)
  const teacherDetails = teacherDetailsData?.teacher
  const bookingIntentMutation = useInPersonBookingIntent()
  const { addToast } = useToast()
  const { data: userData } = useMe()
  const [pointsToUse, setPointsToUse] = useState<number>(0)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  // Calculate available dates from schedule data (dates that have slots)
  const availableDates = useMemo(() => {
    if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
      return [] as Date[]
    }
    
    const dates: Date[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    scheduleData.forEach((scheduleDay) => {
      // Only include dates that have available slots (not booked)
      const hasAvailableSlots = scheduleDay.slots && scheduleDay.slots.some(slot => slot.is_booked === 0)
      
      if (hasAvailableSlots && scheduleDay.date) {
        try {
          const date = new Date(scheduleDay.date)
          if (!Number.isNaN(date.getTime())) {
            const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            dateToCheck.setHours(0, 0, 0, 0)
            
            // Only include today or future dates
            if (dateToCheck >= today) {
              dates.push(date)
            }
          }
        } catch {
          // Skip invalid dates
        }
      }
    })
    
    // Sort dates chronologically
    dates.sort((a, b) => a.getTime() - b.getTime())
    
    return dates
  }, [scheduleData])

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
    availableDates.forEach((date) => {
      const key = toDateOnlyKey(date)
      if (key) keys.add(key)
    })
    return keys
  }, [availableDates])

  useEffect(() => {
    if (availableDates.length > 0) {
      const firstFutureDate = availableDates[0]
      const firstKey = toDateOnlyKey(firstFutureDate)
      if (firstKey && availableDateKeys.has(firstKey)) {
        setSelectedDateKey(firstKey)
        setCurrentMonth(new Date(firstFutureDate.getFullYear(), firstFutureDate.getMonth(), 1))
      }
    } else {
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

  // Get time slots for selected date from schedule data
  const selectedDateTimeSlots = useMemo(() => {
    if (!selectedDateKey || !scheduleData || !Array.isArray(scheduleData)) return []
    
    // Find the schedule day that matches the selected date
    const scheduleDay = scheduleData.find(day => {
      const dayKey = toDateOnlyKey(day.date)
      return dayKey === selectedDateKey
    })
    
    if (!scheduleDay || !scheduleDay.slots) return []
    
    // Return available time slots (not booked)
    return scheduleDay.slots.filter(slot => slot.is_booked === 0)
  }, [selectedDateKey, scheduleData])

  const calendarCells = useMemo(() => buildCalendarGrid(currentMonth), [currentMonth])

  const showTimeSlot = useMemo(() => {
    if (!selectedDateKey || !scheduleData) {
      return false
    }
    
    const hasTimeSlots = selectedDateTimeSlots.length > 0
    return availableDateKeys.has(selectedDateKey) && hasTimeSlots
  }, [selectedDateKey, availableDateKeys, scheduleData, selectedDateTimeSlots])

  // Points system calculations
  const availablePoints = userData?.points || 0
  const slotPrice = Number(data?.price) || 0
  const pointsDiscount = Math.min(pointsToUse, slotPrice, availablePoints) // 1 point = $1
  const newPaymentAmount = Math.max(0, slotPrice - pointsDiscount) // Slot price - points used

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
    // Reset selected time slot when date changes
    setSelectedTimeSlot(null)
  }

  const handleReserveSlot = async () => {
    // Check if user is logged in
    if (!userData?.id) {
      addToast({
        type: 'error',
        title: 'Login Required',
        description: 'Please login first to book this slot.',
        duration: 5000,
      })
      router.push('/signin')
      return
    }

    if (!data || !selectedDate) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Please select a date to reserve the slot.',
        duration: 5000,
      })
      return
    }

    if (!selectedTimeSlot) {
      addToast({
        type: 'error',
        title: 'Missing Selection',
        description: 'Please select a time slot to reserve.',
        duration: 5000,
      })
      return
    }

    try {
      // Calculate the payment amount without service fee (service fee will be added on payment page)
      const safeNewPaymentAmount = Math.max(0, newPaymentAmount)
      
      // Use sessionId directly (from URL params) to ensure we have the correct ID
      // This should match data.id, but using sessionId is more reliable
      const slotIdToSend = sessionId
      
      // Log calculation for debugging
      console.log('💰 In-Person Booking Intent - Request Data:', {
        slot_id: slotIdToSend,
        data_id: data?.id,
        sessionId: sessionId,
        scheduled_date: selectedDate,
        selectedTimeSlotId: selectedTimeSlot?.id,
        slotPrice,
        pointsToUse,
        pointsDiscount,
        newPaymentAmount: safeNewPaymentAmount,
      })
      
      if (!slotIdToSend || !Number.isFinite(slotIdToSend)) {
        throw new Error('Invalid slot ID. Please refresh the page and try again.')
      }
      
      const result = await bookingIntentMutation.mutateAsync({
        slot_id: slotIdToSend, // Use sessionId directly from URL params
        scheduled_date: selectedDate,
        points_to_use: pointsToUse > 0 ? pointsToUse : undefined,
        new_payment_amount: safeNewPaymentAmount,
      })

      // Check if payment is required
      if (result?.requires_payment && result?.client_secret) {
        // Pass amount without service fee - payment page will add it
        // The API should have created payment intent with the correct amount including service fee
        const amountWithoutServiceFee = safeNewPaymentAmount
        
        // Log for debugging
        console.log('💰 In-Person Payment Amount:', {
          slotPrice,
          pointsToUse,
          pointsDiscount,
          newPaymentAmount: safeNewPaymentAmount,
          amountPassedToPaymentPage: amountWithoutServiceFee,
          apiReturnedAmount: result.amount,
        })
        
        // Build URL with payment data as query parameters
        const paymentParams = new URLSearchParams({
          client_secret: result.client_secret,
          amount: String(amountWithoutServiceFee), // Amount without service fee
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
            className="text-gray-400 hover:text-white hover:bg-gray-800/70 mb-8 cursor-pointer transition-all duration-300 group"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to in-person sessions</span>
          </Button>

          {isLoading ? (
            <Card className="bg-gray-800/80 border border-gray-700">
              <CardContent className="py-16 flex justify-center">
                <CalendarIcon className="h-10 w-10 text-orange-500 animate-pulse" />
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
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                          {data.price ? `$${Number(data.price).toFixed(2)}` : 'Free'}
                        </div>
                        <div className="text-sm text-gray-400">per session</div>
                      </div>
                      {data?.video && (
                        <div 
                          className="w-48 aspect-video rounded-lg overflow-hidden border border-gray-700 bg-black shadow-lg cursor-pointer group relative"
                          onClick={() => setIsVideoModalOpen(true)}
                        >
                          <video 
                            src={resolveMediaUrl(data.video) || data.video} 
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                              <Play className="w-6 h-6 text-white ml-1" fill="white" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isScheduleLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                      <p className="text-gray-400">Loading availability...</p>
                    </div>
                  ) : !scheduleData || scheduleData.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                      <CalendarIcon className="h-12 w-12 text-gray-600 mx-auto" />
                      <p className="text-gray-400">No available slots found for this session.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left: Calendar and Slot Selection */}
                      <div className="lg:col-span-2 space-y-8">
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                              <CalendarIcon className="w-6 h-6 text-orange-500" />
                              Select Date
                            </h2>
                            <div className="flex items-center gap-3 text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={handlePrevMonth}>
                                <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <span className="font-medium min-w-[120px] text-center">
                                {new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(currentMonth)}
                              </span>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={handleNextMonth}>
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Calendar Grid */}
                          <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4">
                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="py-2">{day}</div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {calendarCells.map(({ date, isCurrentMonth }) => {
                                const key = toDateOnlyKey(date)
                                const isAvailable = key ? availableDateKeys.has(key) : false
                                const isSelected = key === selectedDateKey
                                
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                const dateToCheck = new Date(date)
                                dateToCheck.setHours(0, 0, 0, 0)
                                const isPastDate = dateToCheck < today
                                const isDisabled = !isAvailable || isPastDate

                                return (
                                  <button
                                    key={`${date.toISOString()}-${isCurrentMonth}`}
                                    onClick={() => handleDateSelect(date)}
                                    className={`relative flex h-14 items-center justify-center rounded-lg border text-sm transition-all duration-200 ${
                                      isSelected
                                        ? 'border-orange-600 bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] z-10'
                                        : isAvailable && !isPastDate
                                        ? 'border-orange-500/30 bg-orange-500/5 text-orange-200 hover:border-orange-500 hover:bg-orange-500/10'
                                        : isCurrentMonth
                                        ? 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                                        : 'border-transparent text-gray-700 cursor-not-allowed opacity-20'
                                    }`}
                                    disabled={isDisabled}
                                  >
                                    <span className="font-semibold">{date.getDate()}</span>
                                    {isAvailable && !isSelected && !isPastDate && (
                                      <span className="absolute bottom-2 h-1 w-1 rounded-full bg-orange-500" />
                                    )}
                                    {isSelected && (
                                      <span className="absolute bottom-2 h-1 w-4 rounded-full bg-white/50" />
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                        {/* Available Slots for Selected Date */}
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="flex items-center justify-between mt-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                              <Clock className="w-6 h-6 text-orange-500" />
                              Available Slots
                              {selectedDate && (
                                <span className="text-sm font-normal text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50 ml-2">
                                  {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </h2>
                          </div>

                          {!selectedDateKey ? (
                            <div className="py-12 border-2 border-dashed border-gray-800 rounded-xl text-center text-gray-500">
                              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                              <p className="text-gray-400">Pick a date on the calendar to view available times</p>
                            </div>
                          ) : !selectedDateTimeSlots || selectedDateTimeSlots.length === 0 ? (
                            <div className="py-12 bg-gray-800/30 rounded-xl text-center text-gray-400 border border-gray-700/50">
                              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                              <p>No slots available for the selected date.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {selectedDateTimeSlots.map((slot) => {
                                const isSelected = selectedTimeSlot?.id === slot.id
                                
                                return (
                                  <button
                                    key={slot.id}
                                    onClick={() => setSelectedTimeSlot(slot)}
                                    className={`group relative px-5 py-4 rounded-xl border transition-all duration-200 text-left ${
                                      isSelected
                                        ? 'border-orange-500 bg-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-[1.02]'
                                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-orange-500/50 hover:bg-gray-800 hover:scale-[1.01]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${
                                        isSelected 
                                          ? 'bg-white/20' 
                                          : 'bg-orange-500/10 group-hover:bg-orange-500/20'
                                      }`}>
                                        <Clock className={`w-4 h-4 ${
                                          isSelected ? 'text-white' : 'text-orange-400'
                                        }`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className={`font-semibold text-sm mb-1 ${
                                          isSelected ? 'text-white' : 'text-white'
                                        }`}>
                                          {formatTimeRange(slot.start_time, slot.end_time)}
                                        </div>
                                        <div className={`text-xs ${
                                          isSelected ? 'text-orange-100' : 'text-gray-400'
                                        }`}>
                                          {(() => {
                                            const start = new Date(`1970-01-01T${slot.start_time}`)
                                            const end = new Date(`1970-01-01T${slot.end_time}`)
                                            const diffMs = end.getTime() - start.getTime()
                                            const diffMins = Math.round(diffMs / 60000)
                                            const hours = Math.floor(diffMins / 60)
                                            const mins = diffMins % 60
                                            return hours > 0 
                                              ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim()
                                              : `${diffMins}m`
                                          })()} session
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <div className="flex-shrink-0">
                                          <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Meet your Master - Enhanced Professional Section */}
                        <div className="pt-12 border-t border-gray-700/50">
                          <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                              <Award className="w-6 h-6 text-orange-500" />
                              Meet your Master
                            </h2>
                            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-3 py-1">
                              Expert Mentor
                            </Badge>
                          </div>
                          
                          <div className="relative group">
                            {/* Decorative Background Element */}
                            <div className="absolute -inset-0.5 bg-orange-600/10 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                            
                            <div className="relative bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 md:p-8 overflow-hidden">
                              <div className="flex flex-col md:grid md:grid-cols-12 gap-8 relative z-10">
                                
                                {/* Avatar and Identity - MD: Col 4 */}
                                <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
                                  <div className="relative mb-6">
                                    <div className="h-28 w-28 md:h-32 md:w-32 rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 flex items-center justify-center text-4xl md:text-5xl text-white font-black shadow-2xl transform transition-transform group-hover:scale-105 duration-500">
                                      {data.teacher?.name?.[0] || 'M'}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 h-6 w-6 rounded-full border-4 border-gray-800 shadow-xl" title="Online" />
                                    {/* Subtle ring animation */}
                                    <div className="absolute -inset-2 border border-orange-500/20 rounded-[2rem] animate-pulse" />
                                  </div>
                                  
                                  <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{data.teacher?.name}</h3>
                                  <p className="text-orange-400 font-medium text-sm mb-4">
                                    {teacherDetails?.title || 'Expert In-Person Session Mentor'}
                                  </p>
                                  
                                  <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                      <span className="text-xl font-bold text-white">{teacherDetails?.average_rating || '5.0'}</span>
                                      <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(teacherDetails?.average_rating || 5) ? 'fill-current' : 'opacity-30'}`} />
                                        ))}
                                      </div>
                                    </div>
                                    <div className="h-8 w-px bg-gray-700" />
                                    <div className="flex flex-col">
                                      <span className="text-xl font-bold text-white">{teacherDetails?.total_sessions || '0'}</span>
                                      <span className="text-[10px] text-gray-500 uppercase font-bold">Sessions</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Body Content - MD: Col 8 */}
                                <div className="md:col-span-8 flex flex-col justify-between">
                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-orange-400" />
                                        About the Mentor
                                      </h4>
                                      <p className="text-gray-300 text-base leading-relaxed">
                                        {data.teacher?.name} is a verified Brain Bridge Master specializing in <span className="text-orange-300 font-semibold">{data.subject?.name}</span>. 
                                        Approaching education with a focus on hands-on learning and personalized feedback, {data.teacher?.name} is dedicated to helping students 
                                        master professional concepts through direct interaction and real-world application.
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Top Expertise</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {teacherDetails?.skills && teacherDetails.skills.length > 0 ? (
                                          teacherDetails.skills.slice(0, 4).map((skill) => (
                                            <div 
                                              key={skill.id} 
                                              className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/5 border border-orange-500/20 rounded-xl text-xs text-orange-200 font-medium hover:bg-orange-500/10 transition-colors"
                                            >
                                              <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                                              {skill.name}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-gray-500 text-sm italic">General {data.subject?.name} Expertise</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-8 pt-8 border-t border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-3">
                                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[11px] text-green-400 font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        VERIFIED MASTER
                                      </div>
                                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] text-blue-400 font-semibold">
                                        <Users className="w-3.5 h-3.5" />
                                        TOP 1% MENTOR
                                      </div>
                                    </div>
                                    
                                    <Button 
                                      asChild 
                                      variant="ghost" 
                                      className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 group/btn"
                                    >
                                      <Link href={`/masters/${data.teacher?.id}`} className="flex items-center">
                                        View Master Profile
                                        <ChevronRightIcon className="w-4 h-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Booking Summary & Details */}
                      <div className="space-y-6">
                        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6 space-y-6 sticky top-28">
                          <div>
                            <h3 className="text-gray-400 font-semibold mb-4 text-center tracking-wide uppercase text-xs">Booking Summary</h3>
                            {selectedTimeSlot ? (
                              <div className="space-y-4 bg-orange-600/10 border border-orange-500/20 rounded-xl p-5 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-orange-600/20 rounded-lg text-orange-400">
                                    <CalendarIcon className="w-5 h-5" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-black">Confirmed Date</span>
                                    <span className="text-sm font-bold text-white">
                                      {selectedDate?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-orange-600/20 rounded-lg text-orange-400">
                                    <Clock className="w-5 h-5" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-black">Time Range</span>
                                    <span className="text-sm font-bold text-white">{formatTimeRange(selectedTimeSlot.start_time, selectedTimeSlot.end_time)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-10 px-4 rounded-xl bg-gray-800/50 border border-dashed border-gray-700">
                                <p className="text-xs text-gray-500 italic">Select your preferred date and time slot to confirm booking</p>
                              </div>
                            )}
                          </div>

                          {/* Points Usage Section */}
                          {availablePoints > 0 && slotPrice > 0 && (
                            <div className="pt-4 border-t border-gray-700/50">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-white flex items-center gap-2 text-[10px] uppercase font-bold">
                                    <Sparkles className="w-3 h-3 text-yellow-400" />
                                    Use Points (1 pt = $1)
                                  </Label>
                                  <span className="text-xs text-gray-400">
                                    <span className="text-yellow-400 font-semibold">{availablePoints}</span> pts
                                  </span>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={Math.min(availablePoints, Math.floor(slotPrice))}
                                    value={pointsToUse || ''}
                                    onChange={(e) => handlePointsChange(e.target.value)}
                                    placeholder="0"
                                    className="bg-gray-800 border-gray-700 text-white flex-1"
                                    disabled={bookingIntentMutation.isPending}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleMaxPoints}
                                    className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-900/30 text-[10px] px-3 font-bold"
                                    disabled={bookingIntentMutation.isPending || availablePoints === 0}
                                  >
                                    MAX
                                  </Button>
                                </div>
                                
                                {pointsToUse > 0 && (
                                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs space-y-1">
                                    <div className="flex justify-between text-yellow-400">
                                      <span>Points Discount:</span>
                                      <span>-${pointsDiscount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-white font-bold pt-1 border-t border-yellow-500/20 mt-1">
                                      <span>Final Amount:</span>
                                      <span>${newPaymentAmount.toFixed(2)}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <Button 
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer py-7 text-base font-bold shadow-xl shadow-orange-600/20 active:scale-95 transition-transform"
                            disabled={!selectedTimeSlot || bookingIntentMutation.isPending}
                            onClick={handleReserveSlot}
                          >
                            {bookingIntentMutation.isPending ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                Reserving...
                              </>
                            ) : (
                              `Book This Slot • $${(newPaymentAmount > 0 ? newPaymentAmount : 0).toFixed(2)}`
                            )}
                          </Button>
                          
                          <p className="text-[10px] text-gray-600 text-center font-medium">
                            $7.95 flat service fee will be added on payment page
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Video Modal */}
      {data?.video && (
        <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
          <DialogContent className="max-w-4xl w-full bg-gray-900 border-gray-700 p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <VideoIcon className="w-5 h-5 text-orange-500" />
                  {data.title || 'Session Introduction Video'}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>
            <div className="p-6">
              <div className="relative w-full rounded-lg overflow-hidden border border-gray-700 bg-black shadow-2xl">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
                >
                  <video
                    src={resolveMediaUrl(data.video) || data.video}
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
              {data.description && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

