'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMe } from '@/hooks/use-me'
import { useToast } from '@/components/ui/toast'
import { User, Mail, Phone, MapPin, Calendar, Shield, Loader2, Edit, Copy, Check, Gift, Award } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { data: user, isLoading, error } = useMe()
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)

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

  const handleCopyReferralCode = async () => {
    if (!user.referral_code) return

    try {
      await navigator.clipboard.writeText(user.referral_code)
      setCopied(true)
      addToast({
        type: 'success',
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        description: 'Failed to copy referral code. Please try again.',
        duration: 3000,
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between pt-5">
              <div>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Your account details and information
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push('/dashboard/settings')}
                variant="outline"
                className="border-orange-600 text-orange-400 hover:bg-orange-900/30 cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
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
              {/* Referral Points Section - Right side (only for non-teacher users) */}
              {!user.roles?.some(role => role.name === 'teacher') && (
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Award className="h-3 w-3 text-yellow-400" />
                    <span>Referral Points</span>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg px-4 py-3">
                    <p className="text-2xl font-bold text-yellow-400">
                      {user.points ?? 0}
                    </p>
                  </div>
                </div>
              )}
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

            {/* Referral Code Section - Only for non-teacher users */}
            {!user.roles?.some(role => role.name === 'teacher') && user.referral_code && (
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                  <Gift className="h-4 w-4 text-orange-400" />
                  <span>Referral Code</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3">
                    <p className="text-white font-mono font-semibold text-lg">{user.referral_code}</p>
                  </div>
                  <Button
                    onClick={handleCopyReferralCode}
                    variant="outline"
                    size="sm"
                    className={`border-orange-600 text-orange-400 hover:bg-orange-900/30 cursor-pointer ${
                      copied ? 'border-green-600 text-green-400' : ''
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-gray-400 text-xs mt-2">Share this code with friends to earn rewards!</p>
              </div>
            )}

            {/* Teacher Information */}
            {user.teacher && (
              <div className="pt-4 border-t border-gray-700 space-y-6">
                {/* Teacher Level Progress */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-400" />
                    Teacher Level Progress
                  </h3>
                  {(() => {
                    const currentLevel = user.teacher?.teacher_level
                    const currentRating = parseFloat(user.teacher?.average_rating?.toString() || '0')
                    const levels = [
                      { name: 'Bronze', minRating: 0, benefits: 'Base Pay', color: 'from-amber-600 to-amber-800', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
                      { name: 'Silver', minRating: 4.3, benefits: '+10% Pay', color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-400/20', borderColor: 'border-gray-400/30' },
                      { name: 'Gold', minRating: 4.5, benefits: '+20% Pay', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-400/20', borderColor: 'border-yellow-400/30' },
                      { name: 'Platinum', minRating: 4.6, benefits: '+35% Pay', color: 'from-cyan-400 to-cyan-600', bgColor: 'bg-cyan-400/20', borderColor: 'border-cyan-400/30' },
                      { name: 'Master', minRating: 4.7, benefits: 'Custom Pay', color: 'from-purple-500 to-purple-700', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
                    ]
                    
                    const currentLevelIndex = levels.findIndex(l => l.name === currentLevel?.level_name) >= 0 
                      ? levels.findIndex(l => l.name === currentLevel?.level_name)
                      : 0
                    const currentLevelData = levels[currentLevelIndex]
                    const nextLevelData = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null
                    
                    const progressToNext = nextLevelData 
                      ? Math.min(100, ((currentRating - currentLevelData.minRating) / (nextLevelData.minRating - currentLevelData.minRating)) * 100)
                      : 100
                    const ratingNeeded = nextLevelData ? (nextLevelData.minRating - currentRating).toFixed(2) : '0.00'
                    
                    return (
                      <div className="space-y-4">
                        {/* Current Level Badge */}
                        <div className={`p-4 rounded-lg border ${currentLevelData.bgColor} ${currentLevelData.borderColor}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentLevelData.color} flex items-center justify-center text-white font-bold text-lg`}>
                                {currentLevelData.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-lg">{currentLevelData.name} Level</p>
                                <p className="text-gray-400 text-sm">{currentLevelData.benefits}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400 text-xs">Current Rating</p>
                              <p className="text-white font-bold text-xl">{currentRating.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {/* Progress to Next Level */}
                          {nextLevelData && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">
                                  Progress to {nextLevelData.name}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {progressToNext.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${currentLevelData.color} transition-all duration-500 rounded-full`}
                                  style={{ width: `${Math.max(0, progressToNext)}%` }}
                                />
                              </div>
                              <p className="text-gray-400 text-xs mt-2">
                                {parseFloat(ratingNeeded) > 0 
                                  ? `Need ${ratingNeeded} more rating to reach ${nextLevelData.name} level`
                                  : `You've reached ${currentLevelData.name} level!`
                                }
                              </p>
                            </div>
                          )}
                          
                          {!nextLevelData && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/20 to-purple-700/20 border border-purple-500/30 rounded-lg">
                              <p className="text-purple-300 text-sm font-medium text-center">
                                🏆 You've reached the highest level! Keep up the excellent work!
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* All Levels Preview */}
                        <div className="grid grid-cols-5 gap-2">
                          {levels.map((level, index) => {
                            const isCurrent = level.name === currentLevel?.level_name
                            const isUnlocked = index <= currentLevelIndex
                            return (
                              <div
                                key={level.name}
                                className={`p-2 rounded-lg border text-center transition-all ${
                                  isCurrent
                                    ? `${level.bgColor} ${level.borderColor} border-2 scale-105`
                                    : isUnlocked
                                    ? 'bg-gray-700/30 border-gray-600'
                                    : 'bg-gray-800/50 border-gray-700 opacity-50'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
                                  isCurrent
                                    ? `bg-gradient-to-br ${level.color} text-white`
                                    : isUnlocked
                                    ? 'bg-gray-600 text-gray-300'
                                    : 'bg-gray-700 text-gray-500'
                                }`}>
                                  {level.name.charAt(0)}
                                </div>
                                <p className={`text-xs font-medium ${
                                  isCurrent ? 'text-white' : isUnlocked ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                  {level.name}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  isCurrent ? 'text-orange-400' : 'text-gray-500'
                                }`}>
                                  {level.minRating > 0 ? level.minRating : 'Start'}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>
                
                {/* Teacher Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Teacher Statistics</h3>
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
                      <p className="text-gray-400 text-sm mb-1">Five Star Reviews</p>
                      <p className="text-white">{user.teacher.five_star_reviews || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Streak Good Sessions</p>
                      <p className="text-white">{user.teacher.streak_good_sessions || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Rebook Count</p>
                      <p className="text-white">{user.teacher.rebook_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Cancelled Sessions</p>
                      <p className="text-white">{user.teacher.cancelled_sessions || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Base Pay</p>
                      <p className="text-white">${parseFloat(user.teacher.base_pay || '0').toFixed(2)}</p>
                    </div>
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
