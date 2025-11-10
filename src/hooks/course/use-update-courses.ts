'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

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
  const headers: Record<string, string> = {}

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export interface UpdateVideoRequest {
  id?: number
  title: string
  description: string
  duration_hours: string
  is_published: boolean
  file?: File | null
  video_url?: string | null
  type?: string | null
}

export interface UpdateModuleRequest {
  id?: number
  title: string
  description: string
  order_index: number
  videos: UpdateVideoRequest[]
}

export interface UpdateCourseRequest {
  title: string
  description: string
  subject_id: string
  price: string
  old_price?: string
  is_published: boolean
  teacher_id: string
  thumbnail?: File | null
  modules: UpdateModuleRequest[]
}

const updateCourse = async (id: number, payload: UpdateCourseRequest) => {
  const formData = new FormData()

  formData.append('title', payload.title)
  formData.append('description', payload.description)
  formData.append('subject_id', payload.subject_id)
  formData.append('price', payload.price)
  formData.append('is_published', payload.is_published ? '1' : '0')
  formData.append('teacher_id', payload.teacher_id)

  if (payload.old_price && payload.old_price.trim().length > 0) {
    formData.append('old_price', payload.old_price)
  }

  if (payload.thumbnail) {
    formData.append('thumbnail_url', payload.thumbnail, payload.thumbnail.name)
  }

  payload.modules.forEach((module, moduleIndex) => {
    if (module.id !== undefined) {
      formData.append(`modules[${moduleIndex}][id]`, module.id.toString())
    }
    formData.append(`modules[${moduleIndex}][title]`, module.title)
    formData.append(`modules[${moduleIndex}][description]`, module.description)
    formData.append(`modules[${moduleIndex}][order_index]`, module.order_index.toString())

    module.videos.forEach((video, videoIndex) => {
      if (video.id !== undefined) {
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][id]`, video.id.toString())
      }
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][title]`, video.title)
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][description]`, video.description)
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][duration_hours]`, video.duration_hours)
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][is_published]`, video.is_published ? '1' : '0')
      if (video.type) {
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][type]`, video.type)
      }

      if (video.file) {
        formData.append(
          `modules[${moduleIndex}][videos][${videoIndex}][video_url]`,
          video.file,
          video.file.name
        )
      } else if (video.video_url) {
        formData.append(
          `modules[${moduleIndex}][videos][${videoIndex}][video_url]`,
          video.video_url
        )
      }
    })
  })

  const headers = {
    ...getAuthHeaders(),
    Accept: 'application/json',
  }

  const url = joinUrl(`courses/${id}`)

  let response: Response

  try {
    response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    })
  } catch (networkError) {
    console.error('Update course network error:', networkError)
    throw new Error('Unable to reach the Brain Bridge API. Please verify your connection and try again.')
  }

  let result: any
  try {
    const text = await response.text()
    result = text ? JSON.parse(text) : {}
  } catch (error) {
    throw new Error('Invalid response from server')
  }

  if (!response.ok) {
    const errorMessage = result?.message || result?.error || `Failed to update course (${response.status})`
    throw new Error(errorMessage)
  }

  return result
}

export const useUpdateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseRequest }) => updateCourse(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] })
    },
  })
}

