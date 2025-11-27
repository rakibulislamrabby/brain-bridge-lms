"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import Footer from "@/components/shared/Footer"
import { useLogin } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/toast"

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
    'Content-Type': 'application/json',
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// Fetch user profile to get roles - using same pattern as use-me.ts
interface MeResponse {
  user: {
    id: number
    name: string
    email: string
    roles?: Array<{
      id: number
      name: string
      guard_name: string
      [key: string]: any
    }>
    [key: string]: any
  }
}

const fetchMe = async () => {
  const headers = getAuthHeaders()
  const url = joinUrl('me')

  console.log('Fetching user profile from /me endpoint:', url)
  console.log('Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'None' })

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  console.log('Response status:', response.status, response.statusText)

  // Get response as text first to see raw data
  const text = await response.text()
  console.log('Raw response text:', text)
  console.log('Response text length:', text.length)

  if (!response.ok) {
    let errorResult: any = null
    try {
      errorResult = text ? JSON.parse(text) : null
    } catch (e) {
      console.error('Failed to parse error response:', e)
    }
    const errorMessage = errorResult?.message || errorResult?.error || `Failed to fetch user profile: ${response.status}`
    throw new Error(errorMessage)
  }

  // Parse JSON response
  let result: any = null
  try {
    result = text ? JSON.parse(text) : null
  } catch (parseError) {
    console.error('Failed to parse JSON response:', parseError)
    throw new Error('Invalid JSON response from server')
  }

  console.log('Parsed response:', result)
  console.log('Response structure keys:', Object.keys(result || {}))
  
  // Check if response has user property
  if (result?.user) {
    console.log('User data found:', result.user)
    console.log('User roles:', result.user.roles)
    if (result.user.roles && Array.isArray(result.user.roles)) {
      console.log('Roles array length:', result.user.roles.length)
      result.user.roles.forEach((role: any, index: number) => {
        console.log(`Role ${index}:`, role)
        console.log(`Role ${index} name:`, role?.name)
      })
    }
    return result.user
  }

  // If no user property, return the whole result (might be structured differently)
  console.warn('No user property in response, returning full result')
  return result
}

export default function SignIn() {
  const router = useRouter()
  const loginMutation = useLogin()
  const { addToast } = useToast()
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Helper function to determine redirect path based on user roles
  const getRedirectPath = (user: any): string => {
    if (!user) {
      return '/dashboard'
    }
    
    console.log('User data for redirect:', user)
    console.log('User roles:', user.roles)
    
    // Check if user has roles array
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      const roleNames = user.roles.map((role: any) => role.name || role).filter(Boolean)
      console.log('Role names:', roleNames)
      
      const isStudent = roleNames.includes('student')
      const isTeacher = roleNames.includes('teacher') || roleNames.includes('master')
      
      if (isStudent) {
        return '/courses'
      } else if (isTeacher) {
        return '/dashboard'
      }
    }
    
    // Default to dashboard if roles not available yet
    return '/dashboard'
  }


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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Show validation error toast
      addToast({
        type: "error",
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        duration: 3000
      });
      return
    }

    try {
      console.log('Attempting login with data:', formData);
      const result = await loginMutation.mutateAsync(formData)
      console.log('Login mutation completed successfully:', result);
      
      // Show success toast immediately after successful login
      addToast({
        type: "success",
        title: "Login Successful!",
        description: "Welcome back to Brain Bridge!",
        duration: 3000
      });
      
      // Fetch complete user profile to get roles using /me endpoint
      try {
        const userProfile = await fetchMe()
        console.log('Fetched user profile from /me:', userProfile)
        console.log('User roles:', userProfile?.roles)
        
        // Update localStorage with complete user data
        if (typeof window !== 'undefined' && userProfile) {
          localStorage.setItem('user', JSON.stringify(userProfile))
        }
        
        // Determine redirect path based on user role
        const redirectPath = getRedirectPath(userProfile)
        console.log('Redirecting to:', redirectPath)
        
        // Redirect based on user role
        router.push(redirectPath)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        // Fallback: try to get user from localStorage
        const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        let storedUser = null
        
        if (storedUserStr) {
          try {
            storedUser = JSON.parse(storedUserStr)
          } catch (e) {
            console.error('Error parsing stored user:', e)
          }
        }
        
        // Fallback to result.user if localStorage user not available
        if (!storedUser && result?.user) {
          storedUser = result.user
        }
        
        const redirectPath = getRedirectPath(storedUser)
        router.push(redirectPath)
      }
      
    } catch (error) {
      console.error("Sign in error:", error)
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password. Please try again."
      setErrors({ 
        general: errorMessage
      })
      addToast({
        type: "error",
        title: "Login Failed",
        description: errorMessage,
        duration: 5000
      });
    }
  }

  return (
    <>
      <div className="px-4 max-w-7xl mx-auto bg-gray-900 min-h-screen">
        <AppHeader />
        
        <div className="container py-20 flex justify-center">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white pt-7">Welcome Back</CardTitle>
              <CardDescription className="text-gray-300">
                Sign in to your Brain Bridge account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.password ? "border-red-500" : ""}`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                

                <div className="flex items-center justify-between">
                  <Link href="/forgot-password" className="text-sm text-orange-400 hover:text-orange-300 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer transition-colors duration-200"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-orange-400 hover:text-orange-300 hover:underline">
                    Sign up
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
