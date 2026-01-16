import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || ''

const joinUrl = (path: string) => {
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path
  if (!API_BASE_URL) {
    return `/${trimmedPath}`
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  return `${base}/${trimmedPath}`
}

const getHeaders = (): Record<string, string> => {
  return {
    Accept: 'application/json',
  }
}

export interface InPersonSlotDetailTeacher {
  id: number
  name: string
  email?: string
}

export interface InPersonSlotDetailSubject {
  id: number
  name: string
}

export interface DailyBookedSeats {
  booked: number
}

export interface BookedSlot {
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
}

export interface InPersonSlotTime {
  id: number
  in_person_slot_day_id: number
  start_time: string
  end_time: string
  is_booked: number
  created_at: string
  updated_at: string
}

export interface InPersonSlotDay {
  id: number
  in_person_slot_id: number
  day: string
  created_at: string
  updated_at: string
  times: InPersonSlotTime[]
}

export interface InPersonSlotDetailResponse {
  id: number
  title: string
  teacher: InPersonSlotDetailTeacher
  subject: InPersonSlotDetailSubject
  subject_id: number
  from_date: string
  to_date: string
  start_time?: string
  end_time?: string
  price: string
  description: string
  video?: string | null
  country?: string
  state?: string
  city?: string
  area?: string
  daily_available_seats?: Record<string, DailyBookedSeats> // Key is date string (YYYY-MM-DD), only has "booked"
  booked_slots?: BookedSlot[]
  days?: InPersonSlotDay[]
}

const fetchInPersonSlotDetail = async (id: number): Promise<InPersonSlotDetailResponse> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid in-person slot id provided')
  }

  const url = joinUrl(`in-person-slots/${id}`)
  const headers = getHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch in-person slot (${response.status})`
      throw new Error(errorMessage)
    }

    if (!result || typeof result !== 'object') {
      throw new Error('In-person slot not found')
    }

    return result as InPersonSlotDetailResponse
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch in-person slot')
  }
}

export const useInPersonSlotDetail = (id: number) => {
  return useQuery({
    queryKey: ['in-person-slot', id],
    queryFn: () => fetchInPersonSlotDetail(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 60 * 1000,
  })
}

