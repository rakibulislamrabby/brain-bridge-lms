'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMe } from '@/hooks/use-me'
import { useToast } from '@/components/ui/toast'
import { useTeacherLevelProgress } from '@/hooks/teacher/use-teacher-level-progress'
import { User, Mail, Phone, MapPin, Calendar, Shield, Loader2, Edit, Copy, Check, Gift, Award, Star } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { data: user, isLoading, error } = useMe()
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)
  
  const isTeacher = useMemo(() => {
    return user?.roles?.some(role => role.name === 'teacher') || false
  }, [user])
  
  const { data: levelProgress, isLoading: isLoadingLevelProgress } = useTeacherLevelProgress(isTeacher)

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Profile Header Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 sm:pt-5">
              <div>
                <CardTitle className="text-white text-lg sm:text-xl">Profile Information</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
              Your account details and information
            </CardDescription>
              </div>
              <Button
                onClick={() => router.push('/dashboard/settings')}
                variant="outline"
                size="sm"
                className="border-orange-600 text-orange-400 hover:bg-orange-900/30 cursor-pointer w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.profile_picture ? (
                  <Image
                    src={user.profile_picture}
                    alt={user.name || 'Profile'}
                    width={96}
                    height={96}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-4 break-words">{user.email}</p>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400 flex-shrink-0" />
                  <span className="text-gray-300 break-words">Roles: {roles}</span>
                </div>
              </div>
              {/* Referral Points Section - Right side (only for non-teacher users) */}
              {!user.roles?.some(role => role.name === 'teacher') && (
                <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Award className="h-3 w-3 text-yellow-400" />
                    <span>Referral Points</span>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg px-3 py-2 sm:px-4 sm:py-3 w-full sm:w-auto">
                    <p className="text-xl sm:text-2xl font-bold text-yellow-400 text-center sm:text-right">
                      {user.points ?? 0}
                    </p>
                </div>
              </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-gray-700">
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
                  <Gift className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  <span>Referral Code</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 sm:px-4 sm:py-3 min-w-0">
                    <p className="text-white font-mono font-semibold text-base sm:text-lg break-all sm:break-normal text-center sm:text-left">{user.referral_code}</p>
                  </div>
                  <Button
                    onClick={handleCopyReferralCode}
                    variant="outline"
                    size="sm"
                    className={`border-orange-600 text-orange-400 hover:bg-orange-900/30 cursor-pointer whitespace-nowrap ${
                      copied ? 'border-green-600 text-green-400' : ''
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-gray-400 text-xs mt-2 text-center sm:text-left">Share this code with friends to earn rewards!</p>
              </div>
            )}

            {/* Teacher Information */}
            {user.teacher && (
              <div className="pt-4 border-t border-gray-700 space-y-6">
                {/* Teacher Level Progress */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 flex-shrink-0" />
                    Teacher Level Progress
                  </h3>
                  {isLoadingLevelProgress ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
                    </div>
                  ) : levelProgress ? (() => {
                    const currentRating = parseFloat(user.teacher?.average_rating?.toString() || '0')
                    
                    // Level styling mapping
                    const levelStyles: Record<string, { color: string, bgColor: string, borderColor: string }> = {
                      'Bronze': { color: 'from-amber-600 to-amber-800', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
                      'Silver': { color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-400/20', borderColor: 'border-gray-400/30' },
                      'Gold': { color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-400/20', borderColor: 'border-yellow-400/30' },
                      'Platinum': { color: 'from-cyan-400 to-cyan-600', bgColor: 'bg-cyan-400/20', borderColor: 'border-cyan-400/30' },
                      'Master': { color: 'from-purple-500 to-purple-700', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
                    }
                    
                    const currentLevelName = levelProgress.current_level.name
                    const currentLevelStyle = levelStyles[currentLevelName] || levelStyles['Bronze']
                    const allLevels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Master']
                    const currentLevelIndex = allLevels.findIndex(l => l === currentLevelName)
                    
                    return (
                      <div className="space-y-4">
                        {/* Current Level Badge */}
                        <div className={`p-3 sm:p-4 rounded-lg border ${currentLevelStyle.bgColor} ${currentLevelStyle.borderColor}`}>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${currentLevelStyle.color} flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0`}>
                                {currentLevelName.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-semibold text-base sm:text-lg">{currentLevelName} Level</p>
                                <p className="text-gray-400 text-xs sm:text-sm break-words">{levelProgress.current_level.benefits}</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto">
                              <p className="text-gray-400 text-xs">Current Rating</p>
                              <p className="text-white font-bold text-lg sm:text-xl">{currentRating.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {/* Progress to Next Level */}
                          {!levelProgress.is_max_level && levelProgress.next_level && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">
                                  Progress to {levelProgress.next_level.name}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {levelProgress.progress_percent.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${currentLevelStyle.color} transition-all duration-500 rounded-full`}
                                  style={{ width: `${Math.max(0, Math.min(100, levelProgress.progress_percent))}%` }}
                                />
                              </div>
                              {levelProgress.message && (
                                <p className="text-gray-400 text-xs mt-2">
                                  {levelProgress.message}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {levelProgress.is_max_level && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/20 to-purple-700/20 border border-purple-500/30 rounded-lg">
                              <p className="text-purple-300 text-sm font-medium text-center">
                                🏆 You&apos;ve reached the highest level! Keep up the excellent work!
                  </p>
                </div>
                          )}
                        </div>
                        
                        {/* All Levels Preview */}
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {allLevels.map((levelName, index) => {
                            const isCurrent = levelName === currentLevelName
                            const isUnlocked = index <= currentLevelIndex
                            const levelStyle = levelStyles[levelName] || levelStyles['Bronze']
                            return (
                              <div
                                key={levelName}
                                className={`p-2 rounded-lg border text-center transition-all ${
                                  isCurrent
                                    ? `${levelStyle.bgColor} ${levelStyle.borderColor} border-2 scale-105`
                                    : isUnlocked
                                    ? 'bg-gray-700/30 border-gray-600'
                                    : 'bg-gray-800/50 border-gray-700 opacity-50'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
                                  isCurrent
                                    ? `bg-gradient-to-br ${levelStyle.color} text-white`
                                    : isUnlocked
                                    ? 'bg-gray-600 text-gray-300'
                                    : 'bg-gray-700 text-gray-500'
                                }`}>
                                  {levelName.charAt(0)}
                                </div>
                                <p className={`text-xs font-medium ${
                                  isCurrent ? 'text-white' : isUnlocked ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                  {levelName}
                  </p>
                </div>
                            )
                          })}
                        </div>
                        
                        {/* Requirements */}
                        {levelProgress.requirements && levelProgress.requirements.length > 0 && (
                          <div className="mt-4 p-3 sm:p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                            <h4 className="text-white font-semibold text-xs sm:text-sm mb-2 sm:mb-3">Requirements</h4>
                            <div className="space-y-2">
                              {levelProgress.requirements.map((req, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                                  <span className={`${req.is_met ? 'text-green-400' : 'text-gray-400'} break-words`}>
                                    {req.name}
                                  </span>
                                  <span className={`${req.is_met ? 'text-green-400' : 'text-gray-400'} whitespace-nowrap`}>
                                    {req.current} / {req.required}
                                  </span>
                                </div>
                              ))}
              </div>
                          </div>
                        )}
                      </div>
                    )
                  })() : (
                    <div className="text-gray-400 text-sm py-4">Unable to load level progress</div>
                  )}
            </div>

                {/* Teacher Statistics */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Teacher Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                
                {/* Teacher Skills */}
                {user.teacher.skills && user.teacher.skills.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 flex-shrink-0" />
                      Skills & Expertise
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {user.teacher.skills.map((skill) => {
                        const yearsOfExperience = skill.pivot?.years_of_experience || 0
                        return (
                          <div
                            key={skill.id}
                            className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/40 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-base">{skill.name}</h4>
                              </div>
                              <div className="text-right ml-4">
                                <div className="flex items-center gap-1 text-orange-400">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="text-sm font-medium">{yearsOfExperience}</span>
                                </div>
                                <p className="text-gray-400 text-xs mt-1">
                                  {yearsOfExperience === 1 ? 'year' : 'years'} of experience
                                </p>
                  </div>
                </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
