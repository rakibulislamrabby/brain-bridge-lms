'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { useSubjects } from '@/hooks/subject/use-subject'
import { useCreateInPersonSlot, type InPersonSlotData } from '@/hooks/slots/use-create-in-person-slot'
import { useUpdateInPersonSlot } from '@/hooks/slots/use-update-in-person-slot'
import type { InPersonSlot } from '@/hooks/slots/use-in-person-slots'
import { Loader2, Plus, Trash2, Calendar as CalendarIcon, Clock, DollarSign, ClipboardList, MapPin, CheckCircle2, Video, FileVideo } from 'lucide-react'

interface SlotTimeForm {
  start_time: string
  end_time: string
}

interface DaySlotForm {
  slot_day: string
  times: SlotTimeForm[]
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

interface AddInPersonSlotFormProps {
  slotId?: number
  initialData?: InPersonSlot
}

export default function AddInPersonSlotForm({ slotId, initialData }: AddInPersonSlotFormProps = {}) {
  const { data: subjects = [] } = useSubjects()
  const { addToast } = useToast()
  const router = useRouter()
  const createSlotMutation = useCreateInPersonSlot()
  const updateSlotMutation = useUpdateInPersonSlot()
  const isEditMode = !!slotId && !!initialData

  const subjectOptions = useMemo(() => (
    subjects.map((subject) => ({
      value: subject.id.toString(),
      label: subject.name,
    }))
  ), [subjects])

  const [formData, setFormData] = useState({
    subject_id: '',
    title: '',
    from_date: '',
    to_date: '',
    price: '',
    description: '',
    country: '',
    state: '',
    city: '',
    area: '',
  })

  const [daySlots, setDaySlots] = useState<DaySlotForm[]>([
    { slot_day: 'Sunday', times: [{ start_time: '', end_time: '' }] },
  ])

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRemoveVideo = (e: React.MouseEvent) => {
    e.stopPropagation()
    setVideoFile(null)
    setVideoPreview(initialData?.video || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setVideoFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  // Initialize form with slot data if in edit mode
  useEffect(() => {
    if (isEditMode && initialData && subjects.length > 0) {
      // Format date from ISO string to YYYY-MM-DD
      const formatDateForInput = (dateString?: string): string => {
        if (!dateString) return ''
        const date = new Date(dateString)
        if (Number.isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0]
      }

      // Format time from HH:MM:SS to HH:MM
      const formatTimeForInput = (timeString?: string): string => {
        if (!timeString) return ''
        if (timeString.split(':').length === 3) {
          const [hours, minutes] = timeString.split(':')
          return `${hours}:${minutes}`
        }
        return timeString
      }

      // Find the subject to check if it has base_pay
      const selectedSubject = subjects.find((s) => s.id === initialData.subject_id)
      const priceValue = selectedSubject?.base_pay !== null && selectedSubject?.base_pay !== undefined
        ? selectedSubject.base_pay.toString()
        : (initialData.price || '')

      setFormData({
        subject_id: initialData.subject_id.toString(),
        title: initialData.title || '',
        from_date: formatDateForInput(initialData.from_date),
        to_date: formatDateForInput(initialData.to_date),
        price: priceValue,
        description: initialData.description || '',
        country: initialData.country || '',
        state: initialData.state || '',
        city: initialData.city || '',
        area: initialData.area || '',
      })

      if (initialData.days && initialData.days.length > 0) {
        setDaySlots(initialData.days.map(day => ({
          slot_day: day.day,
          times: day.times.map(t => ({
            start_time: formatTimeForInput(t.start_time),
            end_time: formatTimeForInput(t.end_time),
          }))
        })))
      } else if (initialData.start_time && initialData.end_time) {
        // Fallback for old structure
        setDaySlots([{
          slot_day: 'Sunday',
          times: [{
            start_time: formatTimeForInput(initialData.start_time),
            end_time: formatTimeForInput(initialData.end_time),
          }]
        }])
      }

      if (initialData.video) {
        setVideoPreview(initialData.video)
      }
    }
  }, [isEditMode, initialData, subjects])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      }
      
      // Auto-populate price from subject's base_pay when subject is selected
      if (name === 'subject_id' && value) {
        const selectedSubject = subjects.find((s) => s.id.toString() === value)
        if (selectedSubject?.base_pay !== null && selectedSubject?.base_pay !== undefined) {
          updated.price = selectedSubject.base_pay.toString()
        }
      }
      
      return updated
    })
  }

  // Check if price should be disabled (when subject has base_pay)
  const isPriceDisabled = useMemo(() => {
    if (!formData.subject_id) return false
    const selectedSubject = subjects.find((s) => s.id.toString() === formData.subject_id)
    return selectedSubject?.base_pay !== null && selectedSubject?.base_pay !== undefined
  }, [formData.subject_id, subjects])

  const handleDayChange = (dayIndex: number, value: string) => {
    setDaySlots((prev) => {
      const updated = [...prev]
      updated[dayIndex] = { ...updated[dayIndex], slot_day: value }
      return updated
    })
  }

  const handleTimeChange = (dayIndex: number, timeIndex: number, field: keyof SlotTimeForm, value: string) => {
    setDaySlots((prev) => {
      const updated = [...prev]
      const updatedDay = { ...updated[dayIndex] }
      const updatedTimes = [...updatedDay.times]
      updatedTimes[timeIndex] = { ...updatedTimes[timeIndex], [field]: value }
      updatedDay.times = updatedTimes
      updated[dayIndex] = updatedDay
      return updated
    })
  }

  const addDaySlot = () => {
    setDaySlots((prev) => [...prev, { slot_day: 'Sunday', times: [{ start_time: '', end_time: '' }] }])
  }

  const removeDaySlot = (index: number) => {
    setDaySlots((prev) => prev.filter((_, i) => i !== index))
  }

  const addTimeSlot = (dayIndex: number) => {
    setDaySlots((prev) => {
      const updated = [...prev]
      updated[dayIndex] = {
        ...updated[dayIndex],
        times: [...updated[dayIndex].times, { start_time: '', end_time: '' }]
      }
      return updated
    })
  }

  const removeTimeSlot = (dayIndex: number, timeIndex: number) => {
    setDaySlots((prev) => {
      const updated = [...prev]
      updated[dayIndex] = {
        ...updated[dayIndex],
        times: updated[dayIndex].times.filter((_, i) => i !== timeIndex)
      }
      return updated
    })
  }

  const resetForm = () => {
    setFormData({
      subject_id: '',
      title: '',
      from_date: '',
      to_date: '',
      price: '',
      description: '',
      country: '',
      state: '',
      city: '',
      area: '',
    })
    setDaySlots([{ slot_day: 'Sunday', times: [{ start_time: '', end_time: '' }] }])
    setVideoFile(null)
    setVideoPreview(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.subject_id || !formData.title || !formData.from_date || !formData.to_date || !formData.price) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Subject, title, dates, and price are required.',
        duration: 5000,
      })
      return
    }

    const hasInvalidDay = daySlots.some(day => !day.slot_day || day.times.length === 0)
    if (hasInvalidDay) {
      addToast({
        type: 'error',
        title: 'Invalid Schedule',
        description: 'Each day must have a selected day and at least one time slot.',
        duration: 5000,
      })
      return
    }

    const hasInvalidTime = daySlots.some(day => 
      day.times.some(time => !time.start_time || !time.end_time)
    )
    if (hasInvalidTime) {
      addToast({
        type: 'error',
        title: 'Missing Slot Times',
        description: 'Each slot must include both start and end times.',
        duration: 5000,
      })
      return
    }

    const hasInvalidTimeRange = daySlots.some(day => 
      day.times.some(time => {
        const start = new Date(`1970-01-01T${time.start_time}`)
        const end = new Date(`1970-01-01T${time.end_time}`)
        return end <= start
      })
    )
    
    if (hasInvalidTimeRange) {
      addToast({
        type: 'error',
        title: 'Invalid Time Range',
        description: 'End time must be after start time for each slot.',
        duration: 5000,
      })
      return
    }

    // Format times to ensure they're in HH:MM format (as expected by API)
    const formatTime = (time: string): string => {
      if (!time) return time
      // Remove seconds if present (convert HH:MM:SS to HH:MM)
      if (time.split(':').length === 3) {
        const [hours, minutes] = time.split(':')
        return `${hours}:${minutes}`
      }
      // If already in HH:MM format, return as is
      return time
    }

    // Ensure dates are in YYYY-MM-DD format (not datetime)
    const formatDate = (date: string): string => {
      if (!date) return date
      // If date includes time, extract just the date part
      if (date.includes('T')) {
        return date.split('T')[0]
      }
      return date
    }

    const payload: any = {
      title: formData.title,
      subject_id: Number(formData.subject_id),
      from_date: formatDate(formData.from_date),
      to_date: formatDate(formData.to_date),
      slots: daySlots.map((day) => ({
        slot_day: (day.slot_day || 'Sunday').trim(),
        times: day.times.map(slot => ({
          start_time: formatTime(slot.start_time),
          end_time: formatTime(slot.end_time),
        }))
      })),
      price: Number(formData.price),
      description: formData.description,
      ...(formData.country && { country: formData.country }),
      ...(formData.state && { state: formData.state }),
      ...(formData.city && { city: formData.city }),
      ...(formData.area && { area: formData.area }),
    }

    if (videoFile instanceof File) {
      payload.video = videoFile
    }

    try {
      if (isEditMode && slotId) {
        const result = await updateSlotMutation.mutateAsync({ id: slotId, payload })
        const slotsCount = result?.data?.length || 0
        const slotsText = slotsCount === 1 ? 'slot' : 'slots'
        
        addToast({
          type: 'success',
          title: 'In-Person Slot Updated',
          description: `${result?.message || 'Success!'} ${slotsCount} ${slotsText} updated.`,
          duration: 6000,
        })
        router.push('/dashboard/in-person-session')
      } else {
        const result = await createSlotMutation.mutateAsync(payload)
        addToast({
          type: 'success',
          title: 'In-Person Slot Created',
          description: result?.message || 'In-person slot created successfully!',
          duration: 5000,
        })
        resetForm()
      }
    } catch (error) {
      let errorMessage = isEditMode 
        ? 'Failed to update in-person slot. Please try again.'
        : 'Failed to create in-person slot. Please try again.'
      
      if (error instanceof Error) {
        errorMessage = error.message
        // Check if it's a validation error about time
        if (error.message.includes('end_time') && error.message.includes('start_time')) {
          errorMessage = 'End time must be after start time for all slots. Please check your time ranges.'
        }
      }
      
      addToast({
        type: 'error',
        title: isEditMode ? 'Error Updating Slot' : 'Error Creating Slot',
        description: errorMessage,
        duration: 6000,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {isEditMode ? 'Edit In-Person Session' : 'Schedule In-Person Session'}
        </h1>
        <p className="text-gray-400 mt-2">
          {isEditMode 
            ? 'Update the availability windows, pricing, and time slots for your in-person class.'
            : 'Configure availability windows, pricing, and time slots for your in-person class.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <CalendarIcon className="h-5 w-5 text-orange-500" />
              Slot Details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Define the timing, availability, and pricing for your in-person session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject_id" className="text-sm font-medium text-gray-300">
                  Subject <span className="text-red-400">*</span>
                </Label>
                <select
                  id="subject_id"
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  required
                  className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-10"
                >
                  <option value="">Select a subject</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-300">
                  Session Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Graphics Design hands on class"
                  required
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from_date" className="text-sm font-medium text-gray-300">
                  Available From <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="from_date"
                  name="from_date"
                  type="date"
                  value={formData.from_date}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="to_date" className="text-sm font-medium text-gray-300">
                  Available To <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="to_date"
                  name="to_date"
                  type="date"
                  value={formData.to_date}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Price <span className="text-red-400">*</span>
                  {isPriceDisabled && (
                    <span className="text-xs text-gray-400 ml-2">(from subject base pay)</span>
                  )}
                </Label>
                <div className={`mt-2 flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white ${isPriceDisabled ? 'opacity-75' : ''}`}>
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="50"
                    required
                    disabled={isPriceDisabled}
                    className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this in-person session covers"
                className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <MapPin className="h-5 w-5 text-orange-500" />
              Location Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              Optional: Specify the location where the in-person session will take place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country" className="text-sm font-medium text-gray-300">
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g., USA"
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-medium text-gray-300">
                  State/Province
                </Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g., New York"
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-gray-300">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., New York City"
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="area" className="text-sm font-medium text-gray-300">
                  Area/Neighborhood
                </Label>
                <Input
                  id="area"
                  name="area"
                  type="text"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="e.g., Manhattan, Downtown"
                  className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700/50">
              <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Video className="h-4 w-4 text-orange-400" />
                Intro Video
              </Label>
              <div className="mt-3 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div 
                    className="relative group border-2 border-dashed border-gray-600 rounded-xl p-8 transition-all hover:border-orange-500/50 hover:bg-gray-700/30 text-center cursor-pointer"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    <input
                      id="video-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileVideo className="h-6 w-6 text-gray-400 group-hover:text-orange-400" />
                      </div>
                      <p className="text-sm text-gray-300 font-medium">Click to upload intro video</p>
                      <p className="text-xs text-gray-500 mt-1">MP4, WebM or Ogg (Max 50MB)</p>
                    </div>
                  </div>
                </div>

                {videoPreview && (
                  <div className="w-full md:w-64 space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Preview</p>
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-600">
                      <video 
                        src={videoPreview} 
                        className="w-full h-full object-cover"
                        controls
                      />
                      {videoFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-red-600 text-white rounded-full p-1"
                          onClick={handleRemoveVideo}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {videoFile && (
                      <p className="text-[10px] text-orange-400 truncate font-medium">
                        {videoFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slot times */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <Clock className="h-5 w-5 text-orange-500" />
              Time Slots
            </CardTitle>
            <CardDescription className="text-gray-400">
              Add one or more sessions for the selected date. Each day can have multiple time slots.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daySlots.map((daySlot, dayIndex) => (
              <div key={dayIndex} className="border border-gray-700 rounded-lg p-6 bg-gray-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-[200px]">
                    <Label className="text-sm font-medium text-gray-300">
                      Day of Week <span className="text-red-400">*</span>
                    </Label>
                    <select
                      value={daySlot.slot_day}
                      onChange={(e) => handleDayChange(dayIndex, e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-10"
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  {daySlots.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDaySlot(dayIndex)}
                      className="border-red-700 text-red-400 hover:bg-red-900/30 cursor-pointer mt-6"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove Day
                    </Button>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <Label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Slots for {daySlot.slot_day}
                  </Label>
                  
                  {daySlot.times.map((timeSlot, timeIndex) => (
                    <div key={timeIndex} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-800/50 p-4 rounded-md border border-gray-700/50">
                      <div className="md:col-span-5">
                        <Label className="text-xs font-medium text-gray-400">Start Time</Label>
                        <Input
                          type="time"
                          value={timeSlot.start_time}
                          onChange={(e) => handleTimeChange(dayIndex, timeIndex, 'start_time', e.target.value)}
                          required
                          className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-orange-500 h-9"
                        />
                      </div>
                      <div className="md:col-span-5">
                        <Label className="text-xs font-medium text-gray-400">End Time</Label>
                        <Input
                          type="time"
                          value={timeSlot.end_time}
                          onChange={(e) => handleTimeChange(dayIndex, timeIndex, 'end_time', e.target.value)}
                          required
                          className="mt-1 bg-gray-700 border-gray-600 text-white focus:border-orange-500 h-9"
                        />
                      </div>
                      <div className="md:col-span-2 pt-6">
                        {daySlot.times.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTimeSlot(dayIndex, timeIndex)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-9 w-9"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTimeSlot(dayIndex)}
                    className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Time Slot
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addDaySlot}
              className="w-full border-dashed border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-950/10 py-6"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Day to Schedule
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button
            type="submit"
            disabled={createSlotMutation.isPending || updateSlotMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
          >
            {(createSlotMutation.isPending || updateSlotMutation.isPending) ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {isEditMode ? 'Updating Slot...' : 'Creating Slot...'}
              </>
            ) : (
              isEditMode ? 'Update In-Person Slot' : 'Create In-Person Slot'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

