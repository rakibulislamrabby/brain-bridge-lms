'use client'

import { useMemo, useState, useEffect } from 'react'
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
import { Loader2, Plus, Trash2, Calendar as CalendarIcon, Clock, DollarSign, ClipboardList, MapPin, CheckCircle2 } from 'lucide-react'

interface SlotTimeForm {
  start_time: string
  end_time: string
}

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

  const [slotTimes, setSlotTimes] = useState<SlotTimeForm[]>([
    { start_time: '', end_time: '' },
  ])

  // Initialize form with slot data if in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
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

      setFormData({
        subject_id: initialData.subject_id.toString(),
        title: initialData.title || '',
        from_date: formatDateForInput(initialData.from_date),
        to_date: formatDateForInput(initialData.to_date),
        price: initialData.price || '',
        description: initialData.description || '',
        country: initialData.country || '',
        state: initialData.state || '',
        city: initialData.city || '',
        area: initialData.area || '',
      })

      setSlotTimes([
        {
          start_time: formatTimeForInput(initialData.start_time),
          end_time: formatTimeForInput(initialData.end_time),
        },
      ])
    }
  }, [isEditMode, initialData])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSlotChange = (index: number, field: keyof SlotTimeForm, value: string) => {
    setSlotTimes((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      return updated
    })
  }

  const addTimeRange = () => {
    setSlotTimes((prev) => [...prev, { start_time: '', end_time: '' }])
  }

  const removeTimeRange = (index: number) => {
    setSlotTimes((prev) => prev.filter((_, i) => i !== index))
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
    setSlotTimes([{ start_time: '', end_time: '' }])
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

    const invalidSlot = slotTimes.some((slot) => !slot.start_time || !slot.end_time)
    if (invalidSlot) {
      addToast({
        type: 'error',
        title: 'Missing Slot Times',
        description: 'Each slot must include both start and end times.',
        duration: 5000,
      })
      return
    }

    // Validate that end_time is after start_time for each slot
    const invalidTimeRange = slotTimes.some((slot) => {
      if (!slot.start_time || !slot.end_time) return false
      const start = new Date(`1970-01-01T${slot.start_time}`)
      const end = new Date(`1970-01-01T${slot.end_time}`)
      return end <= start
    })
    
    if (invalidTimeRange) {
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

    const payload = {
      title: formData.title,
      subject_id: Number(formData.subject_id),
      from_date: formatDate(formData.from_date),
      to_date: formatDate(formData.to_date),
      slots: slotTimes.map((slot) => ({
        start_time: formatTime(slot.start_time),
        end_time: formatTime(slot.end_time),
      })),
      price: Number(formData.price),
      description: formData.description,
      ...(formData.country && { country: formData.country }),
      ...(formData.state && { state: formData.state }),
      ...(formData.city && { city: formData.city }),
      ...(formData.area && { area: formData.area }),
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
        const slotsCount = result?.data?.length || 0
        const slotsText = slotsCount === 1 ? 'slot' : 'slots'
        
        addToast({
          type: 'success',
          title: 'In-Person Slots Created',
          description: `${result?.message || 'Success!'} ${slotsCount} ${slotsText} created.`,
          duration: 6000,
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
                </Label>
                <div className="mt-2 flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="50"
                    required
                    className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
              Add one or more time slots for the selected date range.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {slotTimes.map((slot, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ClipboardList className="h-4 w-4 text-orange-400" />
                    Slot {index + 1}
                  </div>
                  {slotTimes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimeRange(index)}
                      className="border-red-700 text-red-400 hover:bg-red-900/30 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-300">
                      Start Time <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={(event) => handleSlotChange(index, 'start_time', event.target.value)}
                      required
                      className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300">
                      End Time <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={(event) => handleSlotChange(index, 'end_time', event.target.value)}
                      required
                      min={slot.start_time || undefined}
                      className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                    />
                    {slot.start_time && slot.end_time && (
                      (() => {
                        const start = new Date(`1970-01-01T${slot.start_time}`)
                        const end = new Date(`1970-01-01T${slot.end_time}`)
                        const isValid = end > start
                        return !isValid ? (
                          <p className="text-xs text-red-400 mt-1">End time must be after start time</p>
                        ) : null
                      })()
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addTimeRange}
              className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Time Slot
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

