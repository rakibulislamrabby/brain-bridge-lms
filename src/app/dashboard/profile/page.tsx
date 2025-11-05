'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMe } from '@/hooks/use-me'
import { useToast } from '@/components/ui/toast'
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Shield,
  Award,
  Loader2,
  XCircle,
  Settings,
  Lock,
  Bell,
  Phone,
  MapPin,
  Star,
  BookOpen,
  TrendingUp
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { data: user, isLoading, error } = useMe()
  const { addToast } = useToast()

  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load profile. Please try again.'
      addToast({
        type: 'error',
        title: 'Error Loading Profile',
        description: errorMessage,
        duration: 5000
      })
    }
  }, [error, addToast])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8">
              <div className="text-center">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500 opacity-50" />
                <h2 className="text-xl font-semibold text-white mb-2">Error Loading Profile</h2>
                <p className="text-gray-400 mb-4">
                  {error instanceof Error ? error.message : 'Failed to load your profile. Please try again.'}
                </p>
                <Button
                  onClick={() => router.push('/signin')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Go to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 mt-2">Manage your account information and settings</p>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="bg-gradient-to-r from-orange-600/30 to-orange-700 px-6 py-8 rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                <span className="text-orange-600 font-bold text-3xl">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-white flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  {user.role && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-orange-100 mb-1">{user.email}</p>
                {user.title && (
                  <p className="text-orange-200 text-sm">{user.title}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2  pt-5">
                <User className="h-5 w-5 text-orange-500" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <User className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Full Name</p>
                  <p className="font-medium text-white">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <Mail className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Email Address</p>
                  <p className="font-medium text-white">{user.email}</p>
                </div>
              </div>
              
              {user.created_at && (
                <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Member Since</p>
                    <p className="font-medium text-white">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {user.phone && (
                <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <Phone className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                    <p className="font-medium text-white">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.address && (
                <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Address</p>
                    <p className="font-medium text-white">{user.address}</p>
                  </div>
                </div>
              )}

              {user.title && (
                <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <Award className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Title</p>
                    <p className="font-medium text-white">{user.title}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 pt-5">
                <Settings className="h-5 w-5 text-orange-500" />
                Account Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline"
                className="w-full justify-between bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 hover:text-orange-400 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-between bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 hover:text-orange-400 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4" />
                  <span>Change Password</span>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-between bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 hover:text-orange-400 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  <span>Notification Settings</span>
                </div>
              </Button>

              <Button 
                variant="outline"
                className="w-full justify-between bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 hover:text-orange-400 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4" />
                  <span>Privacy & Security</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Information (if user is a teacher) */}
        {user.teacher && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 pt-5">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Teacher Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your teaching statistics and level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.teacher_level && (
                  <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <div className="p-2 bg-orange-600/20 rounded-lg">
                      <Award className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Teacher Level</p>
                      <p className="font-medium text-white">{user.teacher_level}</p>
                      {user.teacher.teacher_level?.benefits && (
                        <p className="text-xs text-gray-500 mt-1">{user.teacher.teacher_level.benefits}</p>
                      )}
                    </div>
                  </div>
                )}

                {user.teacher.average_rating !== undefined && user.teacher.average_rating !== null && (
                  <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <div className="p-2 bg-orange-600/20 rounded-lg">
                      <Star className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Average Rating</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{user.teacher.average_rating.toFixed(1)}</p>
                        <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <BookOpen className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Total Sessions</p>
                    <p className="font-medium text-white">{user.teacher.total_sessions}</p>
                  </div>
                </div>

                {user.teacher.base_pay && (
                  <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <div className="p-2 bg-orange-600/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Base Pay</p>
                      <p className="font-medium text-white">${parseFloat(user.teacher.base_pay).toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
          {/* <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.role && (
                  <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <div className="p-3 bg-orange-600/20 rounded-lg">
                      <Shield className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Account Type</p>
                      <p className="font-medium text-white capitalize">{user.role}</p>
                    </div>
                  </div>
                )}

                {user.bio && (
                  <div className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 md:col-span-2">
                    <div className="p-2 bg-orange-600/20 rounded-lg">
                      <User className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Bio</p>
                      <p className="font-medium text-white">{user.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}
      </div>
    </DashboardLayout>
  )
}
