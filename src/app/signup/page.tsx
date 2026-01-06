"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import Footer from "@/components/shared/Footer"
import { useRegisterTeacher, useRegisterStudent } from "@/hooks/use-rolebased-auth"
import { useToast } from "@/components/ui/toast"
import { GraduationCap, User } from "lucide-react"

function SignUpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registerTeacherMutation = useRegisterTeacher()
  const registerStudentMutation = useRegisterStudent()
  const { addToast } = useToast()
  
  // Check URL parameter for role and set initial tab
  const [activeTab, setActiveTab] = useState<'student' | 'master'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('role') === 'master' ? 'master' : 'student'
    }
    return 'student'
  })

  // Update tab if URL parameter changes
  useEffect(() => {
    const role = searchParams?.get('role')
    if (role === 'master') {
      setActiveTab('master')
    } else if (role === 'student') {
      setActiveTab('student')
    }
  }, [searchParams])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    title: "", // For master/teacher
    referral_code: "", // For student registration
    address: "", // For both
    date_of_birth: "", // For both
    profile_picture: null as File | null // For master only
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    
    // Handle file input for profile_picture
    if (name === 'profile_picture' && files && files[0]) {
      const file = files[0]
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear error
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ""
        }))
      }
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full name"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long"
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name must be less than 100 characters"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address (e.g., example@email.com)"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Please create a password"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
    } else if (formData.password.length > 128) {
      newErrors.password = "Password must be less than 128 characters"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password by entering it again"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match. Please make sure both passwords are identical"
    }

    // Validate title for master/teacher
    if (activeTab === 'master' && !formData.title.trim()) {
      newErrors.title = "Please enter your professional title (e.g., Math Teacher, Science Instructor)"
    } else if (activeTab === 'master' && formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long"
    }

    // Validate date_of_birth for master/teacher
    if (activeTab === 'master' && !formData.date_of_birth) {
      newErrors.date_of_birth = "Please select your date of birth"
    } else if (activeTab === 'master' && formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (birthDate > today) {
        newErrors.date_of_birth = "Date of birth cannot be in the future"
      } else if (age < 18 || (age === 18 && monthDiff < 0)) {
        newErrors.date_of_birth = "You must be at least 18 years old to register as a master"
      } else if (age > 120) {
        newErrors.date_of_birth = "Please enter a valid date of birth"
      }
    }

    // Validate profile_picture for master/teacher
    if (activeTab === 'master' && !formData.profile_picture) {
      newErrors.profile_picture = "Please upload your profile picture"
    } else if (activeTab === 'master' && formData.profile_picture) {
      const file = formData.profile_picture
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      
      if (!allowedTypes.includes(file.type)) {
        newErrors.profile_picture = "Please upload an image file (JPG, PNG, or WEBP format)"
      } else if (file.size > maxSize) {
        newErrors.profile_picture = "Image size must be less than 5MB. Please compress or choose a smaller image"
      }
    }

    setErrors(newErrors)
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateForm()
    if (!validation.isValid) {
      // Convert field names to user-friendly labels
      const fieldLabels: Record<string, string> = {
        name: 'Full Name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        title: 'Title',
        date_of_birth: 'Date of Birth',
        profile_picture: 'Profile Picture',
        address: 'Address',
        referral_code: 'Referral Code'
      }
      
      // Separate required fields (empty) from validation errors
      const requiredFields: string[] = []
      const validationErrors: string[] = []
      
      Object.keys(validation.errors).forEach(key => {
        if (!validation.errors[key]) return
        
        const fieldLabel = fieldLabels[key] || key
        const errorMsg = validation.errors[key].toLowerCase()
        
        // Check if it's a required field error
        if (errorMsg.includes('required') || 
            errorMsg.includes('please enter') || 
            errorMsg.includes('please select') ||
            errorMsg.includes('please upload')) {
          requiredFields.push(fieldLabel)
        } else {
          // It's a validation error with specific message
          validationErrors.push(`${fieldLabel}: ${validation.errors[key]}`)
        }
      })
      
      // Build the error message
      let description = ''
      if (requiredFields.length > 0) {
        description = `Please fill up the following required field${requiredFields.length > 1 ? 's' : ''}: ${requiredFields.join(', ')}`
        if (validationErrors.length > 0) {
          description += `. Also fix: ${validationErrors.join('; ')}`
        }
      } else if (validationErrors.length > 0) {
        description = validationErrors.join('; ')
      } else {
        description = 'Please check all fields and fix the errors'
      }
      
      addToast({
        type: "error",
        title: "Form Validation Failed",
        description: description,
        duration: 7000
      });
      return
    }

    try {
      let result
      
      if (activeTab === 'master') {
        // Register as teacher - include all fields
        const teacherData: any = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          title: formData.title.trim(),
          date_of_birth: formData.date_of_birth, // Required for master
          profile_picture: formData.profile_picture // Required for master
        }
        
        // Add optional fields if provided
        if (formData.address && formData.address.trim()) {
          teacherData.address = formData.address.trim()
        }
        
        console.log('Sending teacher data:', { ...teacherData, profile_picture: teacherData.profile_picture ? 'File' : 'none' })
        result = await registerTeacherMutation.mutateAsync(teacherData)
        addToast({
          type: "success",
          title: "Master Account Created!",
          description: "Your master account has been created. Welcome to Brain Bridge!",
          duration: 3000
        });
      } else {
        // Register as student - include all fields
        const studentData: any = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        }
        // Add referral_code if provided
        if (formData.referral_code && formData.referral_code.trim()) {
          studentData.referral_code = formData.referral_code.trim()
        }
        // Add address if provided
        if (formData.address && formData.address.trim()) {
          studentData.address = formData.address.trim()
        }
        // Add date_of_birth if provided
        if (formData.date_of_birth) {
          studentData.date_of_birth = formData.date_of_birth
        }
        console.log('Sending student data:', studentData)
        result = await registerStudentMutation.mutateAsync(studentData)
        addToast({
          type: "success",
          title: "Student Account Created!",
          description: "Your student account has been created. Welcome to Brain Bridge!",
          duration: 3000
        });
      }
      
      console.log('Registration completed successfully:', result);
      
      // Determine redirect path based on role (we know it from activeTab)
      const redirectPath = activeTab === 'student' ? '/courses' : '/dashboard'
      
      // Redirect after showing toast
      setTimeout(() => {
        if (result?.access_token) {
          router.push(redirectPath)
        } else {
          router.push('/signin')
        }
      }, 1000);
      
    } catch (error) {
      console.error("Sign up error:", error)
      let errorMessage = "An unexpected error occurred. Please try again."
      let errorTitle = "Registration Failed"
      
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase()
        
        // Check for common error patterns and provide meaningful messages
        if (errorText.includes('email') && (errorText.includes('already') || errorText.includes('exists') || errorText.includes('taken'))) {
          errorMessage = "This email address is already registered. Please use a different email or try signing in instead."
          errorTitle = "Email Already Exists"
        } else if (errorText.includes('password') && errorText.includes('weak')) {
          errorMessage = "Password is too weak. Please use a stronger password with a mix of letters, numbers, and special characters."
          errorTitle = "Weak Password"
        } else if (errorText.includes('network') || errorText.includes('fetch') || errorText.includes('connection')) {
          errorMessage = "Unable to connect to the server. Please check your internet connection and try again."
          errorTitle = "Connection Error"
        } else if (errorText.includes('timeout')) {
          errorMessage = "Request timed out. Please try again."
          errorTitle = "Request Timeout"
        } else if (errorText.includes('validation') || errorText.includes('invalid')) {
          errorMessage = "Some information provided is invalid. Please check all fields and try again."
          errorTitle = "Invalid Information"
        } else if (errorText.includes('server') || errorText.includes('500')) {
          errorMessage = "Server error occurred. Please try again in a few moments."
          errorTitle = "Server Error"
        } else {
          // Use the original error message if it's meaningful, otherwise use generic
          errorMessage = error.message || errorMessage
        }
      }
      
      setErrors({ 
        general: errorMessage
      })
      addToast({
        type: "error",
        title: errorTitle,
        description: errorMessage,
        duration: 6000
      });
    }
  }

  return (
    <>
      <div className="px-4 max-w-7xl mx-auto bg-gray-900 min-h-screen">
        <AppHeader />
        
        <div className="container py-14 flex justify-center">
          <Card className="w-full max-w-4xl bg-gray-800 border-gray-700 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white pt-7">Create Account</CardTitle>
              <CardDescription className="text-gray-300">
                Join Brain Bridge to start learning and teaching
              </CardDescription>
              
              {/* Tabs */}
              <div className="flex gap-2 mt-6 border-b border-gray-700 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('student')
                    setFormData({ name: "", email: "", password: "", confirmPassword: "", title: "", referral_code: "", address: "", date_of_birth: "", profile_picture: null })
                    setErrors({})
                    setProfilePicturePreview(null)
                  }}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'student'
                      ? 'text-orange-500 border-b-2 border-orange-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <User className="h-4 w-4" />
                    Become Student
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('master')
                    setFormData({ name: "", email: "", password: "", confirmPassword: "", title: "", referral_code: "", address: "", date_of_birth: "", profile_picture: null })
                    setErrors({})
                    setProfilePicturePreview(null)
                  }}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'master'
                      ? 'text-orange-500 border-b-2 border-orange-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Become Master
                  </div>
                </button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email - Two columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Title (Master only) and Address - Two columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTab === 'master' ? (
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-gray-300">
                        Title <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="e.g., Math Teacher"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.title ? "border-red-500" : ""}`}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="referral_code" className="text-gray-300">
                        Referral Code <span className="text-gray-500 text-xs">(Optional)</span>
                      </Label>
                      <Input
                        id="referral_code"
                        name="referral_code"
                        type="text"
                        placeholder="Enter referral code if you have one"
                        value={formData.referral_code}
                        onChange={handleInputChange}
                        className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.referral_code ? "border-red-500" : ""}`}
                      />
                      {errors.referral_code && (
                        <p className="text-sm text-red-500">{errors.referral_code}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-300">
                      Address <span className="text-gray-500 text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.address ? "border-red-500" : ""}`}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>
                </div>

                {/* Date of Birth and Profile Picture (Master) / Date of Birth (Student) - Two columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-gray-300">
                      Date of Birth {activeTab === 'master' && <span className="text-red-400">*</span>}
                      {activeTab === 'student' && <span className="text-gray-500 text-xs">(Optional)</span>}
                    </Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.date_of_birth ? "border-red-500" : ""}`}
                    />
                    {errors.date_of_birth && (
                      <p className="text-sm text-red-500">{errors.date_of_birth}</p>
                    )}
                  </div>

                  {/* Profile Picture field - Master only */}
                  {activeTab === 'master' && (
                    <div className="space-y-2">
                      <Label htmlFor="profile_picture" className="text-gray-300">
                        Profile Picture <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="profile_picture"
                        name="profile_picture"
                        type="file"
                        accept="image/*"
                        onChange={handleInputChange}
                        className={`bg-gray-700 border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer ${errors.profile_picture ? "border-red-500" : ""}`}
                      />
                      {profilePicturePreview && (
                        <div className="mt-2">
                          <img
                            src={profilePicturePreview}
                            alt="Profile preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
                          />
                        </div>
                      )}
                      {errors.profile_picture && (
                        <p className="text-sm text-red-500">{errors.profile_picture}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Password fields - Two columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.password ? "border-red-500" : ""}`}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer transition-colors duration-200"
                  disabled={
                    registerTeacherMutation.isPending || 
                    registerStudentMutation.isPending
                  }
                >
                  {(registerTeacherMutation.isPending || registerStudentMutation.isPending) 
                    ? "Creating Account..." 
                    : activeTab === 'master' 
                      ? "Become a Master" 
                      : "Become a Student"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link href="/signin" className="text-orange-400 hover:text-orange-300 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function SignUp() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  )
}
