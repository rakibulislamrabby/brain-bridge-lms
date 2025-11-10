'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Loader2, Plus, Trash2, Layers, Video, Info, Settings, Image as ImageIcon } from 'lucide-react'
import { useCreateCourse } from '@/hooks/course/use-create-course'
import { useSubjects } from '@/hooks/subject/use-subject'
import { getStoredUser } from '@/hooks/useAuth'

interface ModuleFormState {
  title: string
  description: string
  order_index: number
  videos: VideoFormState[]
}

interface VideoFormState {
  title: string
  description: string
  duration_hours: string
  is_published: boolean
  file: File | null
}

export default function AddCourseForm() {
  const { addToast } = useToast()
  const createCourseMutation = useCreateCourse()
  const { data: subjects = [] } = useSubjects()

  const [teacherId, setTeacherId] = useState<string>('')

  const [courseInfo, setCourseInfo] = useState({
    title: '',
    description: '',
    subject_id: '',
    price: '',
    old_price: '',
    is_published: true,
  })

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

const [modules, setModules] = useState<ModuleFormState[]>([
    {
      title: '',
      description: '',
      order_index: 1,
      videos: [],
    },
  ])

  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser?.id) {
      setTeacherId(storedUser.id.toString())
    }
  }, [])

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
    updateVideo(moduleIndex, videoIndex, { file })
  }

const addModule = () => {
    setModules((prev) => ([
      ...prev,
      {
        title: '',
        description: '',
        order_index: prev.length + 1,
        videos: [],
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

  const resetForm = () => {
    setCourseInfo({
      title: '',
      description: '',
      subject_id: '',
      price: '',
      old_price: '',
      is_published: true,
    })
    setThumbnailFile(null)
    setModules([
      {
        title: '',
        description: '',
        order_index: 1,
        videos: [],
      },
    ])
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
        if (!video.file) {
          addToast({
            type: 'error',
            title: 'Video File Required',
            description: `Module ${moduleIndex + 1}, Video ${videoIndex + 1} is missing a file upload. Please select a video file before submitting.`,
            duration: 6000,
          })
          return
        }
      }
    }

    try {
      const payload = {
        ...courseInfo,
        teacher_id: teacherId,
        thumbnail: thumbnailFile,
        modules,
      }

      const result = await createCourseMutation.mutateAsync(payload)

      addToast({
        type: 'success',
        title: 'Course Created',
        description: result.message || 'Course created successfully!',
        duration: 5000,
      })

      resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course. Please try again.'
      addToast({
        type: 'error',
        title: 'Error Creating Course',
        description: errorMessage,
        duration: 6000,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Add New Course</h1>
        <p className="text-gray-400 mt-2">Create a new course with modules and videos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <Info className="h-5 w-5 text-orange-500" />
              Course Details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Basic information about the course
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
                placeholder="e.g., Full Stack Web Development"
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
                placeholder="Provide an overview of the course content and objectives"
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
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="thumbnail" className="text-sm font-medium text-gray-300">Thumbnail Image</Label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 cursor-pointer">
                    <ImageIcon className="h-4 w-4 text-orange-400" />
                    <span>Select file</span>
                    <input
                      id="thumbnail"
                      name="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                  {thumbnailFile ? (
                    <span className="text-sm text-gray-400 truncate">
                      {thumbnailFile.name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">No file selected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-gray-300">Price <span className="text-red-400">*</span></Label>
                <Input
                  id="price"
                  name="price"
                  value={courseInfo.price}
                  onChange={handleCourseInfoChange}
                  placeholder="e.g., 129.99"
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
                  placeholder="e.g., 199.99"
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
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
              Organize the course content into modules and attach videos
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
                    <p className="text-sm text-gray-400">Provide details for this module</p>
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
                      placeholder="e.g., Introduction to Web Development"
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
                    placeholder="Describe what learners will gain from this module"
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
                              placeholder="e.g., Getting Started with Web Development"
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
                            <div className="mt-2 flex items-center gap-3">
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
            disabled={createCourseMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
          >
            {createCourseMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating Course...
              </>
            ) : (
              'Create Course'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
