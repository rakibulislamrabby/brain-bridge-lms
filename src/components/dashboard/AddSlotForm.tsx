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
import { useCreateSlot, useUpdateSlot } from '@/hooks/slots/use-create-slot'
import { Loader2, Plus, Trash2, Calendar as CalendarIcon, Clock, Users, DollarSign, ClipboardList, Link as LinkIcon } from 'lucide-react'
import { TeacherSlot } from '@/hooks/slots/teacher/use-teacher-slot'

interface SlotTimeForm {
  start_time: string
  end_time: string
  meeting_link: string
}

const SLOT_TYPES = [
  { value: 'one_to_one', label: 'One-to-One' },
  { value: 'group', label: 'Group' },
]

interface AddSlotFormProps {
  slotId?: number
  initialData?: TeacherSlot
}

export default function AddSlotForm({ slotId, initialData }: AddSlotFormProps = {}) {
  const { data: subjects = [] } = useSubjects()
  const { addToast } = useToast()
  const router = useRouter()
  const createSlotMutation = useCreateSlot()
  const updateSlotMutation = useUpdateSlot()
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
    type: 'one_to_one',
    price: '',
    max_students: '1',
    description: '',
  })

  const [slotTimes, setSlotTimes] = useState<SlotTimeForm[]>([
    { start_time: '', end_time: '', meeting_link: '' },
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
        type: initialData.type || 'one_to_one',
        price: initialData.price || '',
        max_students: initialData.max_students?.toString() || '1',
        description: initialData.description || '',
      })

      setSlotTimes([
        {
          start_time: formatTimeForInput(initialData.start_time),
          end_time: formatTimeForInput(initialData.end_time),
          meeting_link: initialData.meeting_link || '',
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
    setSlotTimes((prev) => [...prev, { start_time: '', end_time: '', meeting_link: '' }])
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
      type: 'one_to_one',
      price: '',
      max_students: '1',
      description: '',
    })
    setSlotTimes([{ start_time: '', end_time: '', meeting_link: '' }])
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
    const invalidTimeRange = slotTimes.some((slot, index) => {
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
      subject_id: Number(formData.subject_id),
      title: formData.title,
      from_date: formatDate(formData.from_date),
      to_date: formatDate(formData.to_date),
      type: formData.type,
      price: Number(formData.price),
      max_students: Number(formData.max_students),
      description: formData.description,
      slots: slotTimes.map((slot) => ({
        start_time: formatTime(slot.start_time),
        end_time: formatTime(slot.end_time),
        meeting_link: slot.meeting_link || '',
      })),
    }

    try {
      if (isEditMode && slotId) {
        const result = await updateSlotMutation.mutateAsync({ id: slotId, payload })
        addToast({
          type: 'success',
          title: 'Slot Updated',
          description: result?.message || 'Slot updated successfully!',
          duration: 5000,
        })
        router.push('/dashboard/one-to-one-session')
      } else {
        const result = await createSlotMutation.mutateAsync(payload)
        addToast({
          type: 'success',
          title: 'Slot Created',
          description: result?.message || 'One-to-one slot created successfully!',
          duration: 5000,
        })
        resetForm()
      }
    } catch (error) {
      let errorMessage = isEditMode 
        ? 'Failed to update slot. Please try again.'
        : 'Failed to create slot. Please try again.'
      
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
          {isEditMode ? 'Edit Live Session' : 'Schedule Live Session'}
        </h1>
        <p className="text-gray-400 mt-2">
          {isEditMode 
            ? 'Update the availability windows, pricing, and time slots for your live class.'
            : 'Configure availability windows, pricing, and time slots for your live class.'}
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
              Define the timing, availability, and pricing for your one-to-one session.
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
                  placeholder="Live Math Class"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Type
                </Label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-10"
                >
                  {SLOT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Price <span className="text-red-400">*</span>
                </Label>
                <div className="mt-2 flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <Input
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="150"
                    className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Max Students
                </Label>
                <div className="mt-2 flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                  <Users className="h-4 w-4 text-purple-400" />
                  <Input
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleInputChange}
                    placeholder="5"
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
                placeholder="Describe what this session covers"
                className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-orange-500 min-h-[100px]"
              />
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
              Add one or more sessions for the selected date.
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
                      min={slot.end_time ? undefined : undefined}
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
                <div>
                  <Label className="text-sm font-medium text-gray-300">
                    Meeting Link
                  </Label>
                  <div className="mt-2 flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2">
                    <LinkIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <Input
                      type="url"
                      value={slot.meeting_link}
                      onChange={(event) => handleSlotChange(index, 'meeting_link', event.target.value)}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the meeting link for this time slot (e.g., Google Meet, Zoom, etc.)
                  </p>
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
          {isEditMode && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/one-to-one-session')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
              disabled={createSlotMutation.isPending || updateSlotMutation.isPending}
            >
              Cancel
            </Button>
          )}
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
              isEditMode ? 'Update Slot' : 'Create Slot'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

