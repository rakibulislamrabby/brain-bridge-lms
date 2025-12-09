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
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export interface SkillPivot {
  teacher_id: number
  skill_id: number
  years_of_experience: number
  created_at: string
  updated_at: string
}

export interface TeacherSkillDetail {
  id: number
  name: string
  subject_id: number
  created_at: string
  updated_at: string
  pivot: SkillPivot
}

export interface TeacherDetails {
  id: number
  user_id: number
  teacher_level_id: number
  title: string
  introduction_video: string | null
  base_pay: string
  total_sessions: number
  average_rating: number
  five_star_reviews: number
  streak_good_sessions: number
  rebook_count: number
  cancelled_sessions: number
  created_at: string
  updated_at: string
  payment_method: string | null
  bank_account_number: string | null
  bank_routing_number: string | null
  bank_name: string | null
  paypal_email: string | null
  stripe_account_id: string | null
  tax_id: string | null
  skills: TeacherSkillDetail[]
}

export interface TeacherCourse {
  id: number
  teacher_id: number
  subject_id: number
  title: string
  description: string
  thumbnail_url: string | null
  old_price: string
  price: string
  is_published: number
  is_main: number
  enrollment_count: number
  processing_status: string
  created_at: string
  updated_at: string
}

export interface DailyAvailableSeats {
  booked: number
  available: number
}

export interface BookedSlot {
  scheduled_date: string
  scheduled_start_time: string
  scheduled_end_time: string
}

export interface AvailableSlot {
  id: number
  title: string
  from_date: string
  to_date: string
  start_time: string
  end_time: string
  type: string
  price: string
  description: string
  daily_available_seats: Record<string, DailyAvailableSeats>
  booked_slots: BookedSlot[]
}

export interface TeacherDetailsResponse {
  status: string
  teacher: TeacherDetails
  courses: TeacherCourse[]
  skills: TeacherSkillDetail[]
  available_slots: AvailableSlot[]
}

const fetchTeacherDetails = async (id: number): Promise<TeacherDetailsResponse> => {
  const url = joinUrl(`teachers/${id}/details`)
  const headers = getAuthHeaders()

  console.log('Fetching teacher details from:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const text = await response.text()
    const result = text ? JSON.parse(text) : null

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `Failed to fetch teacher details (${response.status})`
      throw new Error(errorMessage)
    }

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format')
    }

    const responseData = result as TeacherDetailsResponse

    if (!responseData.teacher) {
      throw new Error('Teacher data not found in response')
    }

    console.log('Teacher details fetched successfully:', responseData.teacher.id)
    return responseData
  } catch (error) {
    console.error('Fetch teacher details error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to fetch teacher details')
  }
}

export const useTeacherDetails = (id: number | null | undefined) => {
  return useQuery({
    queryKey: ['teacher-details', id],
    queryFn: () => fetchTeacherDetails(id!),
    enabled: !!id && Number.isFinite(id),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  })
}

