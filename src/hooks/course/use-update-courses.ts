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
  duration_hours: number
  is_published: number | boolean
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
  subject_id: number
  price: number
  old_price?: number
  is_published: number | boolean
  thumbnail?: File | null
  videoFiles?: Record<string, File>
  modules: UpdateModuleRequest[]
}

interface UpdateCourseResponse {
  success: boolean
  message: string
  data?: unknown
}

const updateCourse = async (id: number, payload: UpdateCourseRequest): Promise<UpdateCourseResponse> => {
  const url = joinUrl(`courses/${id}`)
  
  // Always use FormData for updates to match create structure
  const formData = new FormData()
  
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  }
  
  // Add course fields
  formData.append('title', payload.title)
  formData.append('description', payload.description)
  formData.append('subject_id', payload.subject_id.toString())
  formData.append('price', payload.price.toString())
  if (payload.old_price !== undefined) {
    formData.append('old_price', payload.old_price.toString())
  }
  formData.append('is_published', payload.is_published ? '1' : '0')
  
  // Add thumbnail if present - backend expects 'thumbnail_url' as the field name
  if (payload.thumbnail) {
    formData.append('thumbnail_url', payload.thumbnail)
  }
  
  // Add modules with nested structure
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
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][duration_hours]`, video.duration_hours.toString())
      formData.append(`modules[${moduleIndex}][videos][${videoIndex}][is_published]`, video.is_published ? '1' : '0')
      
      if (video.type) {
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][type]`, video.type)
      }
      
      // Add video file if present
      const videoFileKey = `${moduleIndex}_${videoIndex}`
      if (payload.videoFiles && payload.videoFiles[videoFileKey]) {
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][file]`, payload.videoFiles[videoFileKey])
      } else if (video.video_url && !video.file) {
        // Keep existing video URL if no new file
        formData.append(`modules[${moduleIndex}][videos][${videoIndex}][video_url]`, video.video_url)
      }
    })
  })

  // Don't set Content-Type for FormData, browser will set it with boundary

  let response: Response

  try {
    console.log('Updating course:', { url, method: 'PUT', courseId: id })
    response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    })
  } catch (networkError) {
    console.error('Update course network error:', networkError)
    console.error('Request details:', { url, method: 'PUT', courseId: id })
    throw new Error(`Unable to reach the Brain Bridge API: ${networkError instanceof Error ? networkError.message : 'Unknown error'}`)
  }

  let result: UpdateCourseResponse = { success: false, message: '' }
  try {
    const responseText = await response.text()
    console.log('Update course response:', { status: response.status, statusText: response.statusText, responseText: responseText.substring(0, 200) })
    
    if (responseText && responseText.trim()) {
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError)
        throw new Error(`Invalid JSON response from server (status: ${response.status})`)
      }
    } else if (response.status === 204 || response.status === 200) {
      // No content response - that's OK
      result = { success: true, message: 'Course updated successfully' }
    }
  } catch (error) {
    console.error('Failed to read response:', error)
    if (response.status !== 204 && response.status !== 200) {
      throw error instanceof Error ? error : new Error(`Invalid response from server (status: ${response.status})`)
    }
  }

  if (!response.ok) {
    const errorMessage = (result as any)?.message || (result as any)?.error || `Failed to update course (${response.status})`
    console.error('Update course failed:', { status: response.status, errorMessage, result })
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

