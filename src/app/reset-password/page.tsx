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
import { useToast } from "@/components/ui/toast"
import { Loader2, Mail } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || ''

const joinUrl = (path: string) => {
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path
  if (!API_BASE_URL) {
    return `/${trimmedPath}`
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  return `${base}/${trimmedPath}`
}

interface ResetPasswordRequest {
  email: string
}

interface ResetPasswordResponse {
  message?: string
  success?: boolean
  [key: string]: any
}

const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const url = joinUrl('password/reset')
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const text = await response.text()
  let result: ResetPasswordResponse = {}
  
  try {
    result = text ? JSON.parse(text) : {}
  } catch (parseError) {
    console.error('Failed to parse response:', parseError)
    throw new Error('Invalid response from server')
  }

  if (!response.ok) {
    const errorMessage = result?.message || result?.error || `Failed to reset password (${response.status})`
    throw new Error(errorMessage)
  }

  return result
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const { addToast } = useToast()
  
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setEmail(value)
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
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
        description: "Please enter a valid email address.",
        duration: 3000
      })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      console.log('Requesting password reset for email:', email)
      const result = await resetPassword({ email })
      console.log('Password reset response:', result)
      
      setIsSuccess(true)
      
      addToast({
        type: "success",
        title: "Reset Link Sent",
        description: "If an account exists with this email, you will receive a password reset link shortly.",
        duration: 5000
      })
    } catch (error) {
      console.error("Password reset error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset link. Please try again."
      
      // Don't reveal if email exists or not for security
      setErrors({
        general: "If an account exists with this email, you will receive a password reset link."
      })
      
      // Still show success message for security (don't reveal email existence)
      setIsSuccess(true)
      
      addToast({
        type: "info",
        title: "Check Your Email",
        description: "If an account exists with this email, you will receive a password reset link.",
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="px-4 max-w-7xl mx-auto bg-gray-900 min-h-screen">
        <AppHeader />
        
        <div className="container py-20 flex justify-center">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-orange-600/20 rounded-full">
                  <Mail className="h-8 w-8 text-orange-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white pt-2">
                Reset Password
              </CardTitle>
              <CardDescription className="text-gray-300 mt-2">
                {isSuccess 
                  ? "Check your email for password reset instructions"
                  : "Enter your email address and we'll send you a link to reset your password"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleInputChange}
                      className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 ${errors.email ? "border-red-500" : ""}`}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                    {errors.general && (
                      <p className="text-sm text-orange-400">{errors.general}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-green-600/20 rounded-lg border border-green-600/30">
                    <p className="text-green-400 text-sm">
                      If an account exists with this email, you will receive a password reset link shortly. 
                      Please check your inbox and spam folder.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsSuccess(false)
                      setEmail("")
                      setErrors({})
                    }}
                    variant="outline"
                    className="w-full border-orange-600 text-orange-400 hover:bg-orange-900/30"
                  >
                    Send Another Reset Link
                  </Button>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Remember your password?{" "}
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

