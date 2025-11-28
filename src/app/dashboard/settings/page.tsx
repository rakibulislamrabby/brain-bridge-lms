'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useMe } from '@/hooks/use-me'
import { useUpdateProfile, ProfileSkill } from '@/hooks/use-update-profile'
import { useSkills } from '@/hooks/skills/use-skills'
import { useToast } from '@/components/ui/toast'
import { Loader2, Plus, X, Save, Image as ImageIcon, Video, Upload, XCircle } from 'lucide-react'
import { getStoredUser } from '@/hooks/useAuth'

export default function SettingsPage() {
  const router = useRouter()
  const { data: user, isLoading: loadingUser } = useMe()
  const { data: skills = [] } = useSkills()
  const updateProfileMutation = useUpdateProfile()
  const { addToast } = useToast()
  const [storedUser, setStoredUser] = useState<{ id: number; name: string; email: string } | null>(null)

  const isTeacher = useMemo(() => {
    return user?.roles?.some(role => role.name === 'teacher') || false
  }, [user])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    profile_picture: '',
    // Teacher-specific
    title: '',
    introduction_video: '',
    base_pay: '',
  })

  // File state for uploads
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [introductionVideoFile, setIntroductionVideoFile] = useState<File | null>(null)
  const [introductionVideoPreview, setIntroductionVideoPreview] = useState<string | null>(null)

  const [userSkills, setUserSkills] = useState<Array<{ skill_id: number; years_of_experience: number }>>([])

  // Initialize form data from user profile
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        address: user.address || '',
        profile_picture: user.profile_picture || '',
        title: user.teacher?.title || '',
        introduction_video: user.teacher?.introduction_video || '',
        base_pay: user.teacher?.base_pay || '',
      })
      
      // Set previews from existing URLs (only if no file is currently selected)
      if (!profilePictureFile && user.profile_picture) {
        setProfilePicturePreview(user.profile_picture)
      }
      if (!introductionVideoFile && user.teacher?.introduction_video) {
        setIntroductionVideoPreview(user.teacher.introduction_video)
      }

      // Load existing skills if teacher has them (check both user.skills and teacher.skills)
      if (isTeacher) {
        const userSkillsData = (user as any).skills || user.teacher?.skills || []
        if (Array.isArray(userSkillsData) && userSkillsData.length > 0) {
          setUserSkills(userSkillsData.map((skill: any) => ({
            skill_id: skill.skill_id || skill.id || skill.pivot?.skill_id || 0,
            years_of_experience: skill.years_of_experience || skill.pivot?.years_of_experience || 0,
          })))
        }
      }
    }
  }, [user, isTeacher])

  useEffect(() => {
    const stored = getStoredUser()
    if (!stored) {
      router.push('/signin')
      return
    }
    setStoredUser(stored)
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addToast({
          type: 'error',
          title: 'Invalid File Type',
          description: 'Please select an image file.',
          duration: 3000,
        })
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File Too Large',
          description: 'Profile picture must be less than 5MB.',
          duration: 3000,
        })
        return
      }
      
      setProfilePictureFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIntroductionVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        addToast({
          type: 'error',
          title: 'Invalid File Type',
          description: 'Please select a video file.',
          duration: 3000,
        })
        return
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File Too Large',
          description: 'Introduction video must be less than 100MB.',
          duration: 3000,
        })
        return
      }
      
      setIntroductionVideoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setIntroductionVideoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveProfilePicture = () => {
    setProfilePictureFile(null)
    setProfilePicturePreview(null)
    setFormData(prev => ({ ...prev, profile_picture: '' }))
  }

  const handleRemoveIntroductionVideo = () => {
    setIntroductionVideoFile(null)
    setIntroductionVideoPreview(null)
    setFormData(prev => ({ ...prev, introduction_video: '' }))
  }

  const handleAddSkill = () => {
    setUserSkills(prev => [...prev, { skill_id: 0, years_of_experience: 0 }])
  }

  const handleRemoveSkill = (index: number) => {
    setUserSkills(prev => prev.filter((_, i) => i !== index))
  }

  const handleSkillChange = (index: number, field: 'skill_id' | 'years_of_experience', value: string | number) => {
    setUserSkills(prev => prev.map((skill, i) => {
      if (i !== index) return skill
      
      if (field === 'skill_id') {
        return { ...skill, [field]: Number(value) }
      } else {
        // For years_of_experience, allow empty string but convert to 0 for storage
        // Handle decimal values like 0.4 (4 months), 1.5 (1.5 years), etc.
        if (value === '' || value === null || value === undefined) {
          return { ...skill, [field]: 0 }
        }
        // Use parseFloat to properly handle decimal values
        const numValue = parseFloat(String(value))
        return { ...skill, [field]: isNaN(numValue) ? 0 : numValue }
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'User data not available. Please refresh the page.',
        duration: 5000,
      })
      return
    }

    try {
      // Prepare the update payload
      const updateData: any = {
        name: formData.name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || null,
        bio: formData.bio || null,
        address: formData.address || null,
      }

      // Only include profile_picture if there's a file to upload or a URL to set
      if (profilePictureFile && profilePictureFile instanceof File) {
        console.log('✅ Profile picture file selected:', profilePictureFile.name, profilePictureFile.size, 'bytes')
        updateData.profile_picture = profilePictureFile
      } else if (formData.profile_picture && formData.profile_picture.trim() !== '' && formData.profile_picture !== user?.profile_picture) {
        // Only include URL if it's different from existing or explicitly provided
        console.log('✅ Profile picture URL provided:', formData.profile_picture)
        updateData.profile_picture = formData.profile_picture
      }

      // Add teacher-specific fields if user is a teacher
      if (isTeacher) {
        updateData.title = formData.title || null
        // Only include introduction_video if there's a file to upload
        if (introductionVideoFile) {
          updateData.introduction_video = introductionVideoFile
        } else if (formData.introduction_video && formData.introduction_video.trim() !== '') {
          updateData.introduction_video = formData.introduction_video
        }
        updateData.base_pay = formData.base_pay ? Number(formData.base_pay) : null
        
        // Only include skills if there are any
        if (userSkills.length > 0) {
          updateData.skills = userSkills.filter(skill => skill.skill_id > 0 && skill.years_of_experience > 0)
        }
      }

      console.log('📤 Sending update data:', {
        hasProfilePictureFile: !!updateData.profile_picture && updateData.profile_picture instanceof File,
        hasIntroductionVideoFile: !!updateData.introduction_video && updateData.introduction_video instanceof File,
        profilePictureType: updateData.profile_picture ? (updateData.profile_picture instanceof File ? 'File' : 'URL/String') : 'none',
        profilePictureFileState: profilePictureFile ? `${profilePictureFile.name} (${profilePictureFile.size} bytes)` : 'null',
        updateDataKeys: Object.keys(updateData)
      })
      
      if (updateData.profile_picture instanceof File) {
        console.log('✅ Profile picture file details:', {
          name: updateData.profile_picture.name,
          size: updateData.profile_picture.size,
          type: updateData.profile_picture.type,
          lastModified: new Date(updateData.profile_picture.lastModified)
        })
      }

      await updateProfileMutation.mutateAsync(updateData)

      // Clear file states after successful upload (they'll be available from the updated user profile)
      setProfilePictureFile(null)
      setIntroductionVideoFile(null)

      addToast({
        type: 'success',
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        duration: 3000,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: errorMessage,
        duration: 5000,
      })
    }
  }

  if (loadingUser) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !storedUser) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your profile and account settings</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white pt-5">Profile Information</CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="+1234567890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile_picture" className="text-white">Profile Picture</Label>
                  <div className="space-y-3">
                    {/* Preview */}
                    {profilePicturePreview && (
                      <div className="relative inline-block">
                        <img
                          src={profilePicturePreview}
                          alt="Profile preview"
                          className="w-32 h-32 object-cover rounded-full border-2 border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveProfilePicture}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* File input */}
                    <label className="inline-flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 cursor-pointer transition-colors">
                      <ImageIcon className="h-4 w-4 text-orange-400" />
                      <span>{profilePictureFile ? 'Change Image' : 'Upload Image'}</span>
                      <input
                        id="profile_picture"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                    
                    {profilePictureFile && (
                      <p className="text-sm text-gray-400">
                        Selected: {profilePictureFile.name} ({(profilePictureFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    
                    {/* Fallback: URL input if no file selected and no existing image */}
                    {!profilePictureFile && !profilePicturePreview && (
                      <div className="mt-2">
                        <Label htmlFor="profile_picture_url" className="text-sm text-gray-400">Or enter URL:</Label>
                        <Input
                          id="profile_picture_url"
                          type="url"
                          value={formData.profile_picture}
                          onChange={(e) => handleInputChange('profile_picture', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white mt-1"
                          placeholder="https://example.com/profile.jpg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Teacher-Specific Fields */}
              {isTeacher && (
                <div className="space-y-4 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Teacher Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">Title</Label>
                      <Input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Senior Teacher"
                      />
                    </div>

                    {/* <div className="space-y-2">
                      <Label htmlFor="base_pay" className="text-white">Base Pay</Label>
                      <Input
                        id="base_pay"
                        type="number"
                        step="0.01"
                        value={formData.base_pay}
                        onChange={(e) => handleInputChange('base_pay', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="50.5"
                      />
                    </div> */}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="introduction_video" className="text-white">Introduction Video</Label>
                    <div className="space-y-3">
                      {/* Preview */}
                      {introductionVideoPreview && (
                        <div className="relative">
                          <video
                            src={introductionVideoPreview}
                            controls
                            className="w-full max-w-md rounded-lg border border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveIntroductionVideo}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      
                      {/* File input */}
                      <label className="inline-flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 cursor-pointer transition-colors">
                        <Video className="h-4 w-4 text-orange-400" />
                        <span>{introductionVideoFile ? 'Change Video' : 'Upload Video'}</span>
                        <input
                          id="introduction_video"
                          type="file"
                          accept="video/*"
                          onChange={handleIntroductionVideoChange}
                          className="hidden"
                        />
                      </label>
                      
                      {introductionVideoFile && (
                        <p className="text-sm text-gray-400">
                          Selected: {introductionVideoFile.name} ({(introductionVideoFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      
                      {/* Fallback: URL input if no file selected and no existing video */}
                      {!introductionVideoFile && !introductionVideoPreview && (
                        <div className="mt-2">
                          <Label htmlFor="introduction_video_url" className="text-sm text-gray-400">Or enter URL:</Label>
                          <Input
                            id="introduction_video_url"
                            type="url"
                            value={formData.introduction_video}
                            onChange={(e) => handleInputChange('introduction_video', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white mt-1"
                            placeholder="https://example.com/videos/intro.mp4"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Skills</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddSkill}
                        className="border-purple-600 text-purple-400 hover:bg-purple-900/30 cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>

                    {userSkills.length === 0 && (
                      <p className="text-sm text-gray-400">No skills added. Click &quot;Add Skill&quot; to add one.</p>
                    )}

                    {userSkills.map((skill, index) => (
                      <div key={index} className="flex gap-3 items-end p-3 bg-gray-700 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Label className="text-white text-sm">Skill</Label>
                          <select
                            value={skill.skill_id}
                            onChange={(e) => handleSkillChange(index, 'skill_id', e.target.value)}
                            className="w-full h-9 rounded-md border border-gray-600 bg-gray-800 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value={0}>Select a skill</option>
                            {skills.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} {s.subject && `(${s.subject.name})`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-white text-sm">Years of Experience</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={skill.years_of_experience}
                            onChange={(e) => handleSkillChange(index, 'years_of_experience', e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="0.5 or 1" 
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSkill(index)}
                          className="border-red-600 text-red-400 hover:bg-red-900/30"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-700">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
