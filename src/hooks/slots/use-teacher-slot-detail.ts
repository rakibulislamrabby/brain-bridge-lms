'use client'

import { useQuery } from '@tanstack/react-query'
import type { TeacherSlot, DaySlot } from './teacher/use-teacher-slot'

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || ''

const joinUrl = (path: string) => {
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path
  if (!API_BASE_URL) {
    return `/${trimmedPath}`
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  return `${base}/${trimmedPath}`
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/** Raw API shape: teacher/slots/{id} returns { success, data } with data.days */
interface ApiDay {
  id?: number
  available_slot_id?: number
  day: string
  times: Array<{
    id?: number
    slot_day_id?: number
    start_time: string
    end_time: string
    meeting_link?: string | null
    [key: string]: unknown
  }>
  [key: string]: unknown
}

interface TeacherSlotEditApiData {
  id: number
  teacher_id: number
  subject_id: number
  title: string
  type: string
  price: string
  description: string
  from_date: string
  to_date: string
  video?: string | null
  is_booked?: boolean
  max_students: number
  booked_count: number
  days?: ApiDay[]
  [key: string]: unknown
}

function transformApiDataToTeacherSlot(raw: TeacherSlotEditApiData): TeacherSlot {
  const slots: DaySlot[] = (raw.days || []).map((d) => ({
    slot_day: d.day || 'Sunday',
    times: (d.times || []).map((t) => ({
      start_time: t.start_time,
      end_time: t.end_time,
      meeting_link: t.meeting_link || '',
    })),
  }))

  return {
    id: raw.id,
    teacher_id: raw.teacher_id,
    subject_id: raw.subject_id,
    title: raw.title,
    type: raw.type,
    price: raw.price,
    description: raw.description,
    video: raw.video,
    from_date: raw.from_date,
    to_date: raw.to_date,
    is_booked: !!raw.is_booked,
    max_students: raw.max_students,
    booked_count: raw.booked_count ?? 0,
    slots,
  }
}

const fetchTeacherSlotDetail = async (id: number): Promise<TeacherSlot> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid slot id provided')
  }

  // GET teacher/slots/{id} (same pattern as in-person: teacher/in-person-slots/{id})
  const url = joinUrl(`teacher/slots/${id}`)
  const headers = getAuthHeaders()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    let result: { success?: boolean; data?: TeacherSlotEditApiData; message?: string; error?: string } = {}

    try {
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('Failed to parse response:', parseError)
      throw new Error('Invalid response format from server')
    }

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch slot (${response.status})`
      throw new Error(errorMessage)
    }

    if (result?.success && result?.data) {
      return transformApiDataToTeacherSlot(result.data)
    }

    if (result?.data && typeof (result.data as { id?: number }).id === 'number') {
      return transformApiDataToTeacherSlot(result.data as TeacherSlotEditApiData)
    }

    throw new Error('Slot not found')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch slot')
  }
}

export const useTeacherSlotDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['teacher-slot-detail', id],
    queryFn: () => fetchTeacherSlotDetail(id!),
    enabled: Number.isFinite(id) && id !== null && id > 0,
    staleTime: 60 * 1000,
  })
}
