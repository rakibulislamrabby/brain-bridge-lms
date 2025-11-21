'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMe } from '@/hooks/use-me'
import { User, Mail, Phone, MapPin, Calendar, Shield, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { data: user, isLoading, error } = useMe()

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 pt-5">
                <Shield className="h-5 w-5 text-red-400" />
                Error Loading Profile
              </CardTitle>
              <CardDescription className="text-gray-400">
                {error?.message || 'Unable to load your profile information.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.refresh()}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const roles = user.roles?.map(role => role.name).join(', ') || 'No roles assigned'

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white pt-5">Profile Information</CardTitle>
            <CardDescription className="text-gray-400">
              Your account details and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.profile_picture ? (
                  <Image
                    src={user.profile_picture}
                    alt={user.name || 'Profile'}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-gray-400 mb-4">{user.email}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-orange-400" />
                  <span className="text-gray-300">Roles: {roles}</span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="text-white">{user.email || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </div>
                <p className="text-white">{user.phone || 'Not provided'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </div>
                <p className="text-white">{user.address || 'Not provided'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member Since</span>
                </div>
                <p className="text-white">{formatDate(user.created_at)}</p>
              </div>
            </div>

            {/* Bio Section */}
            {user.bio && (
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <User className="h-4 w-4" />
                  <span>Bio</span>
                </div>
                <p className="text-gray-300">{user.bio}</p>
              </div>
            )}

            {/* Account Status */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Account Status</p>
                  <p className={`text-sm font-medium ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email Verified</p>
                  <p className={`text-sm font-medium ${user.email_verified_at ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user.email_verified_at ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Teacher Information */}
            {user.teacher && (
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Teacher Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Title</p>
                    <p className="text-white">{user.teacher.title || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
                    <p className="text-white">{user.teacher.total_sessions || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Average Rating</p>
                    <p className="text-white">{user.teacher.average_rating || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Base Pay</p>
                    <p className="text-white">${user.teacher.base_pay || '0'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
