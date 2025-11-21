'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import {
  Loader2,
  Plus,
  Trash2,
  Layers,
  Video,
  Info,
  Settings,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react'
import { useSubjects } from '@/hooks/subject/use-subject'
import { useUpdateCourse, UpdateCourseRequest, UpdateModuleRequest, UpdateVideoRequest } from '@/hooks/course/use-update-courses'
import { CourseResponse } from '@/hooks/course/use-courses'
import { getStoredUser } from '@/hooks/useAuth'

interface ModuleFormState {
  id?: number
  title: string
  description: string
  order_index: number
  videos: VideoFormState[]
}

interface VideoFormState {
  id?: number
  title: string
  description: string
  duration_hours: string
  is_published: boolean
  file: File | null
  video_url?: string | null
  type?: string | null
}

const MEDIA_BASE_URL = 'https://brainbridge.mitwebsolutions.com/'

const resolveMediaUrl = (path?: string | null) => {
  if (!path) {
    return ''
  }
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const base = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}${cleanedPath}`
}

const getBoolean = (value: any) => {
  return value === true || value === 1 || value === '1'
}

interface EditCourseFormProps {
  course: CourseResponse
}

export default function EditCourseForm({ course }: EditCourseFormProps) {
  const { addToast } = useToast()
  const updateCourseMutation = useUpdateCourse()
  const { data: subjects = [] } = useSubjects()

  const [teacherId, setTeacherId] = useState<string>('')

  const [courseInfo, setCourseInfo] = useState({
    title: '',
    description: '',
    subject_id: '',
    price: '',
    old_price: '',
    is_published: false,
  })

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(resolveMediaUrl(course.thumbnail_url))

  const [modules, setModules] = useState<ModuleFormState[]>([])

  useEffect(() => {
    setCourseInfo({
      title: course.title || '',
      description: course.description || '',
      subject_id: course.subject_id ? course.subject_id.toString() : '',
      price: course.price !== undefined && course.price !== null ? String(course.price) : '',
      old_price: course.old_price !== undefined && course.old_price !== null ? String(course.old_price) : '',
      is_published: getBoolean(course.is_published ?? course.status),
    })

    const initialModules = Array.isArray(course.modules) && course.modules.length > 0
      ? course.modules.map((moduleData, index) => {
          const rawVideos = Array.isArray((moduleData as any).video_lessons) && (moduleData as any).video_lessons.length > 0
            ? (moduleData as any).video_lessons
            : (Array.isArray((moduleData as any).videos) ? (moduleData as any).videos : [])

          return {
            id: moduleData.id,
            title: moduleData.title || '',
            description: moduleData.description || '',
            order_index: moduleData.order_index !== undefined ? Number(moduleData.order_index) : index + 1,
            videos: rawVideos.length > 0
              ? rawVideos.map((video: any, videoIndex: number) => ({
                  id: video.id,
                  title: video.title || '',
                  description: video.description || '',
                  duration_hours: video.duration_hours !== undefined && video.duration_hours !== null
                    ? String(video.duration_hours)
                    : '',
                  is_published: video.is_published !== undefined ? Boolean(video.is_published) : true,
                  file: null,
                  video_url: video.video_url || video.url || null,
                  type: video.type || 'video',
                }))
              : [{
                  title: '',
                  description: '',
                  duration_hours: '',
                  is_published: true,
                  file: null,
                }],
          }
        })
      : [{
          title: '',
          description: '',
          order_index: 1,
          videos: [{
            title: '',
            description: '',
            duration_hours: '',
            is_published: true,
            file: null,
          }],
        }]

    setModules(initialModules)

    if (course.teacher_id) {
      setTeacherId(String(course.teacher_id))
    } else {
      const storedUser = getStoredUser()
      if (storedUser?.id) {
        setTeacherId(storedUser.id.toString())
      }
    }
  }, [course])

  const subjectOptions = useMemo(() => {
    return subjects.map((subject) => ({
      value: subject.id.toString(),
      label: subject.name,
    }))
  }, [subjects])

  const handleCourseInfoChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    const { name, value } = target
    const isCheckbox = target instanceof HTMLInputElement && target.type === 'checkbox'

    setCourseInfo((prev) => ({
      ...prev,
      [name]: isCheckbox ? (target as HTMLInputElement).checked : value,
    }))
  }

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setThumbnailFile(file)
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setThumbnailUrl(objectUrl)
    }
  }

  const updateModule = (index: number, updatedModule: Partial<ModuleFormState>) => {
    setModules((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        ...updatedModule,
      }
      return next
    })
  }

  const updateVideo = (
    moduleIndex: number,
    videoIndex: number,
    updatedVideo: Partial<VideoFormState>
  ) => {
    setModules((prev) => {
      const next = [...prev]
      const moduleDraft = { ...next[moduleIndex] }
      const videos = [...moduleDraft.videos]
      videos[videoIndex] = {
        ...videos[videoIndex],
        ...updatedVideo,
      }
      moduleDraft.videos = videos
      next[moduleIndex] = moduleDraft
      return next
    })
  }

  const handleVideoFileChange = (
    moduleIndex: number,
    videoIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null
    updateVideo(moduleIndex, videoIndex, { file, video_url: file ? undefined : modules[moduleIndex].videos[videoIndex].video_url })
  }

  const addModule = () => {
    setModules((prev) => ([
      ...prev,
      {
        title: '',
        description: '',
        order_index: prev.length + 1,
        videos: [{
          title: '',
          description: '',
          duration_hours: '',
          is_published: true,
          file: null,
        }],
      },
    ]))
  }

  const removeModule = (index: number) => {
    setModules((prev) => prev.filter((_, i) => i !== index))
  }

  const addVideo = (moduleIndex: number) => {
    setModules((prev) => {
      const next = [...prev]
      const moduleDraft = { ...next[moduleIndex] }
      moduleDraft.videos = [
        ...moduleDraft.videos,
        {
          title: '',
          description: '',
          duration_hours: '',
          is_published: true,
          file: null,
        },
      ]
      next[moduleIndex] = moduleDraft
      return next
    })
  }

  const removeVideo = (moduleIndex: number, videoIndex: number) => {
    setModules((prev) => {
      const next = [...prev]
      const moduleDraft = { ...next[moduleIndex] }
      moduleDraft.videos = moduleDraft.videos.filter((_, i) => i !== videoIndex)
      next[moduleIndex] = moduleDraft
      return next
    })
  }

  const resetThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailUrl(resolveMediaUrl(course.thumbnail_url))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!teacherId) {
      addToast({
        type: 'error',
        title: 'Missing Teacher',
        description: 'We could not determine your teacher account. Please make sure your profile is linked to a teacher.',
        duration: 6000,
      })
      return
    }

    if (!courseInfo.title.trim() || !courseInfo.description.trim() || !courseInfo.subject_id) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        description: 'Please fill out the course title, description, and subject before submitting.',
        duration: 5000,
      })
      return
    }

    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex += 1) {
      const moduleState = modules[moduleIndex]
      for (let videoIndex = 0; videoIndex < moduleState.videos.length; videoIndex += 1) {
        const video = moduleState.videos[videoIndex]
        if (!video.file && !video.video_url) {
          addToast({
            type: 'error',
            title: 'Video File Required',
            description: `Module ${moduleIndex + 1}, Video ${videoIndex + 1} needs a video file or existing URL.`,
            duration: 6000,
          })
          return
        }
      }
    }

    try {
      // Format modules and videos according to the API structure
      const formattedModules = modules.map((moduleState, moduleIndex) => ({
        id: moduleState.id,
        title: moduleState.title,
        description: moduleState.description,
        order_index: moduleState.order_index || moduleIndex + 1,
        videos: moduleState.videos.map((video) => ({
          id: video.id,
          title: video.title,
          description: video.description,
          duration_hours: parseFloat(video.duration_hours) || 0,
          is_published: video.is_published ? 1 : 0,
          file: video.file || null,
          video_url: video.file ? undefined : video.video_url,
          type: video.type,
        })),
      }))

      // Collect video files with keys for reference
      const videoFiles: Record<string, File> = {}
      modules.forEach((module, moduleIndex) => {
        module.videos.forEach((video, videoIndex) => {
          if (video.file) {
            const videoFileKey = `${moduleIndex}_${videoIndex}`
            videoFiles[videoFileKey] = video.file
          }
        })
      })

      const payload: UpdateCourseRequest = {
        title: courseInfo.title,
        description: courseInfo.description,
        subject_id: parseInt(courseInfo.subject_id, 10),
        price: parseFloat(courseInfo.price) || 0,
        old_price: courseInfo.old_price ? parseFloat(courseInfo.old_price) : undefined,
        is_published: courseInfo.is_published ? 1 : 0,
        thumbnail: thumbnailFile || undefined,
        videoFiles: Object.keys(videoFiles).length > 0 ? videoFiles : undefined,
        modules: formattedModules,
      }

      const result = await updateCourseMutation.mutateAsync({
        id: course.id,
        data: payload,
      })

      addToast({
        type: 'success',
        title: 'Course Updated',
        description: result?.message || 'Course updated successfully!',
        duration: 5000,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update course. Please try again.'
      addToast({
        type: 'error',
        title: 'Error Updating Course',
        description: errorMessage,
        duration: 6000,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Edit Course</h1>
        <p className="text-gray-400 mt-2">Update course details, modules, and videos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <Info className="h-5 w-5 text-orange-500" />
              Course Details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Update the primary information about this course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-300">Course Title <span className="text-red-400">*</span></Label>
              <Input
                id="title"
                name="title"
                value={courseInfo.title}
                onChange={handleCourseInfoChange}
                placeholder="Course title"
                required
                className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-300">Description <span className="text-red-400">*</span></Label>
              <Textarea
                id="description"
                name="description"
                value={courseInfo.description}
                onChange={handleCourseInfoChange}
                placeholder="Describe the course content"
                required
                className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject_id" className="text-sm font-medium text-gray-300">Subject <span className="text-red-400">*</span></Label>
                <select
                  id="subject_id"
                  name="subject_id"
                  value={courseInfo.subject_id}
                  onChange={handleCourseInfoChange}
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
                <Label className="text-sm font-medium text-gray-300">Thumbnail Image</Label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 cursor-pointer">
                    <ImageIcon className="h-4 w-4 text-orange-400" />
                    <span>Select file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                  {thumbnailUrl ? (
                    <div className="flex items-center gap-3">
                      <a
                        href={thumbnailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                      >
                        View current thumbnail
                      </a>
                      {thumbnailFile && (
                        <button
                          type="button"
                          onClick={resetThumbnail}
                          className="text-xs text-gray-400 hover:text-gray-200"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No thumbnail selected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-gray-300">Price <span className="text-red-400">*</span></Label>
                <Input
                  id="price"
                  name="price"
                  value={courseInfo.price}
                  onChange={handleCourseInfoChange}
                  placeholder="Price"
                  required
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                />
              </div>
              <div>
                <Label htmlFor="old_price" className="text-sm font-medium text-gray-300">Old Price</Label>
                <Input
                  id="old_price"
                  name="old_price"
                  value={courseInfo.old_price}
                  onChange={handleCourseInfoChange}
                  placeholder="Previous price"
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  id="is_published"
                  name="is_published"
                  type="checkbox"
                  checked={courseInfo.is_published}
                  onChange={handleCourseInfoChange}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500"
                />
                <Label htmlFor="is_published" className="text-sm font-medium text-gray-300">
                  Publish immediately
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <Layers className="h-5 w-5 text-orange-500" />
              Modules
            </CardTitle>
            <CardDescription className="text-gray-400">
              Update the course modules and their lesson content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {modules.map((moduleState, moduleIndex) => (
              <div key={moduleIndex} className="border border-gray-700 rounded-lg p-4 bg-gray-900/40 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-600/20 text-orange-400 font-bold">
                        {moduleIndex + 1}
                      </span>
                      Module {moduleIndex + 1}
                    </h3>
                    <p className="text-sm text-gray-400">Update module title, description, and lessons</p>
                  </div>
                  {modules.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeModule(moduleIndex)}
                      className="border-red-700 text-red-400 hover:bg-red-900/30 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Module Title</Label>
                    <Input
                      value={moduleState.title}
                      onChange={(event) => updateModule(moduleIndex, { title: event.target.value })}
                      placeholder="Module title"
                      className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-300">Order</Label>
                    <Input
                      type="number"
                      min={1}
                      value={moduleState.order_index}
                      onChange={(event) => updateModule(moduleIndex, { order_index: Number(event.target.value) })}
                      className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300">Description</Label>
                  <Textarea
                    value={moduleState.description}
                    onChange={(event) => updateModule(moduleIndex, { description: event.target.value })}
                    placeholder="Describe what this module covers"
                    className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 min-h-[100px]"
                  />
                </div>

                {/* Videos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-orange-400">
                      <Video className="h-4 w-4" />
                      <span className="text-sm font-medium uppercase tracking-wide">Videos</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addVideo(moduleIndex)}
                      className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Video
                    </Button>
                  </div>

                  {moduleState.videos.length === 0 ? (
                    <p className="text-sm text-gray-500 border border-dashed border-gray-700 rounded-lg p-4 text-center">
                      No videos added yet. Click &quot;Add Video&quot; to include lesson content.
                    </p>
                  ) : (
                    moduleState.videos.map((video, videoIndex) => (
                      <div key={videoIndex} className="border border-gray-700 rounded-lg p-4 bg-gray-800/80 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-base font-semibold text-white flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/20 text-orange-400 text-xs font-bold">
                                {videoIndex + 1}
                              </span>
                              Video {videoIndex + 1}
                            </h4>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeVideo(moduleIndex, videoIndex)}
                            className="border-red-700 text-red-400 hover:bg-red-900/30 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-300">Video Title</Label>
                            <Input
                              value={video.title}
                              onChange={(event) => updateVideo(moduleIndex, videoIndex, { title: event.target.value })}
                              placeholder="Lesson title"
                              className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-300">Duration (hours)</Label>
                            <Input
                              value={video.duration_hours}
                              onChange={(event) => updateVideo(moduleIndex, videoIndex, { duration_hours: event.target.value })}
                              placeholder="e.g., 1.5"
                              className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-300">Description</Label>
                          <Textarea
                            value={video.description}
                            onChange={(event) => updateVideo(moduleIndex, videoIndex, { description: event.target.value })}
                            placeholder="Summarize the content covered in this video"
                            className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 min-h-[80px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-300">Video File</Label>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <label className="inline-flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 cursor-pointer">
                                <Video className="h-4 w-4 text-orange-400" />
                                <span>Select file</span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(event) => handleVideoFileChange(moduleIndex, videoIndex, event)}
                                  className="hidden"
                                />
                              </label>
                              {video.file ? (
                                <span className="text-sm text-gray-400 truncate">
                                  {video.file.name}
                                </span>
                              ) : video.video_url ? (
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="h-4 w-4 text-blue-400" />
                                  <a
                                    href={resolveMediaUrl(video.video_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                                  >
                                    {video.video_url.split('/').pop()}
                                  </a>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No file selected</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pt-6">
                            <input
                              type="checkbox"
                              checked={video.is_published}
                              onChange={(event) => updateVideo(moduleIndex, videoIndex, { is_published: event.target.checked })}
                              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm font-medium text-gray-300">Publish video</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={addModule}
              className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Module
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={updateCourseMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
          >
            {updateCourseMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Updating Course...
              </>
            ) : (
              'Update Course'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

