"use client"

import { useState, useEffect } from "react"
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

export default function SignUp() {
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
    title: "" // For master/teacher
  })
  const [errors, setErrors] = useState<Record<string, string>>({})


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Validate title for master/teacher
    if (activeTab === 'master' && !formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      addToast({
        type: "error",
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        duration: 3000
      });
      return
    }

    try {
      let result
      
      if (activeTab === 'master') {
        // Register as teacher - only send required fields with actual values
        const teacherData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          title: formData.title.trim()
        }
        console.log('Sending teacher data:', teacherData)
        result = await registerTeacherMutation.mutateAsync(teacherData)
        addToast({
          type: "success",
          title: "Master Account Created!",
          description: "Your master account has been created. Welcome to Brain Bridge!",
          duration: 3000
        });
      } else {
        // Register as student - only send required fields with actual values
        const studentData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
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
      
      // Redirect after showing toast
      setTimeout(() => {
        if (result?.access_token) {
          window.location.href = '/'
        } else {
          router.push('/signin')
        }
      }, 2000);
      
    } catch (error) {
      console.error("Sign up error:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again."
      setErrors({ 
        general: errorMessage
      })
      addToast({
        type: "error",
        title: "Registration Failed",
        description: errorMessage,
        duration: 5000
      });
    }
  }

  return (
    <>
      <div className="px-4 max-w-7xl mx-auto bg-gray-900 min-h-screen">
        <AppHeader />
        
        <div className="container py-14 flex justify-center">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white pt-7">Create Account</CardTitle>
              <CardDescription className="text-gray-300">
                Join Brain Bridge to start learning and teaching
              </CardDescription>
              
              {/* Tabs */}
              <div className="flex gap-2 mt-4 border-b border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('student')
                    setFormData({ name: "", email: "", password: "", confirmPassword: "", title: "" })
                    setErrors({})
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
                    setFormData({ name: "", email: "", password: "", confirmPassword: "", title: "" })
                    setErrors({})
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
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                {/* Title field for Master/Teacher */}
                {activeTab === 'master' && (
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
                )}  

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
