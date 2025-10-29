"use client"

import { useState} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import Footer from "@/components/shared/Footer"
import { useLogin } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/toast"

export default function SignIn() {
  const loginMutation = useLogin()
  const { addToast } = useToast()
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
        description: "Welcome back! Redirecting to dashboard...",
        duration: 3000
      });
      
      // Redirect after showing toast
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
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

                {errors.general && (
                  <div className="p-3 text-sm text-red-200 bg-red-900/20 border border-red-700 rounded-md">
                    {errors.general}
                  </div>
                )}

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
