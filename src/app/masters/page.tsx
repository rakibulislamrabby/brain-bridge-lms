'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTeachers } from '@/hooks/teacher/use-teachers'
import { useSkills } from '@/hooks/skills/use-skills'
import { ArrowLeft, Star, Users, Award, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function MastersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const skillId = useMemo(() => {
    const skillParam = searchParams.get('skill_id')
    if (!skillParam) return null
    const parsed = Number(skillParam)
    return Number.isFinite(parsed) ? parsed : null
  }, [searchParams])

  const { data: allTeachers = [], isLoading, error } = useTeachers()
  const { data: skills = [] } = useSkills()
  
  const selectedSkill = useMemo(() => {
    if (!skillId) return null
    return skills.find(skill => skill.id === skillId)
  }, [skillId, skills])

  // Filter teachers by skill - match teachers who have the selected skill
  const teachers = useMemo(() => {
    if (!skillId || !allTeachers.length) return []
    
    return allTeachers.filter((teacher) => {
      // Check if teacher has teacher object with skills array
      if (!teacher.teacher || !teacher.teacher.skills || !Array.isArray(teacher.teacher.skills) || teacher.teacher.skills.length === 0) {
        return false
      }
      
      // Check if any skill matches the selected skill ID
      // Match by skill.id === skillId
      const hasMatchingSkill = teacher.teacher.skills.some(skill => {
        return skill.id === skillId
      })
      
      return hasMatchingSkill
    })
  }, [allTeachers, skillId])

  const handleViewProfile = (userId: number) => {
    router.push(`/dashboard/profile?user_id=${userId}`)
  }

  return (
    <div>
      <AppHeader />
      <main className="bg-gray-900 min-h-screen py-14">
        <div className="max-w-7xl mx-auto px-4">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-gray-800/70 mb-6 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Header Section */}
          <div className="mb-8">
            {selectedSkill ? (
              <>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Masters for {selectedSkill.name}
                </h1>
                {selectedSkill.subject?.name && (
                  <p className="text-gray-400 text-lg">
                    Subject: {selectedSkill.subject.name}
                  </p>
                )}
                <p className="text-gray-300 mt-2">
                  {teachers.length} {teachers.length === 1 ? 'master' : 'masters'} available
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-white mb-4">
                  All Masters
                </h1>
                <p className="text-gray-300 mt-2">
                  {allTeachers.length} {allTeachers.length === 1 ? 'master' : 'masters'} available
                </p>
              </>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
            </div>
          ) : error ? (
            <Card className="bg-red-900/20 border border-red-700/60 text-center">
              <CardContent className="py-16 space-y-3">
                <p className="text-red-200/90">
                  {error instanceof Error ? error.message : 'Unable to load masters. Please try again.'}
                </p>
                <Button onClick={() => router.back()} variant="outline" className="border-red-400 text-red-200 hover:bg-red-400/20">
                  Go back
                </Button>
              </CardContent>
            </Card>
          ) : (skillId ? teachers.length === 0 : allTeachers.length === 0) ? (
            <Card className="bg-gray-800/80 border border-gray-700 text-center">
              <CardContent className="py-16 space-y-3">
                <Users className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">No masters found</h3>
                <p className="text-gray-400">
                  {skillId 
                    ? 'There are no masters available for this skill yet. Check back later!'
                    : 'There are no masters available yet.'}
                </p>
                <Button onClick={() => router.back()} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Go back
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(skillId ? teachers : allTeachers).map((teacher) => {
                const teacherData = teacher.teacher
                if (!teacherData) return null
                
                return (
                  <Card key={teacher.id} className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {teacher.profile_picture ? (
                            <Image
                              src={teacher.profile_picture}
                              alt={teacher.name}
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="text-white font-bold text-xl">
                              {teacher.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1 truncate">
                            {teacher.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2 truncate">
                            {teacherData.title}
                          </p>
                          {teacherData.teacher_level && (
                            <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              {teacherData.teacher_level.level_name}
                            </Badge>
                          )}
                        </div>
                      </div>

                    

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-white">
                            {(teacherData.average_rating || 0).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">
                            {teacherData.total_sessions || 0} sessions
                          </span>
                        </div>
                      </div>

                      {/* {teacherData.skills && teacherData.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {teacherData.skills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill.id}
                                className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs"
                              >
                                {skill.name}
                                {skill.pivot?.years_of_experience && (
                                  <span className="ml-1 text-purple-400">
                                    ({skill.pivot.years_of_experience} {skill.pivot.years_of_experience === 1 ? 'yr' : 'yrs'})
                                  </span>
                                )}
                              </Badge>
                            ))}
                            {teacherData.skills.length > 3 && (
                              <Badge className="bg-gray-700 text-gray-300 border border-gray-600 text-xs">
                                +{teacherData.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )} */}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div>
                          <p className="text-xs text-gray-400">Base Pay</p>
                          <p className="text-lg font-bold text-green-400">
                            ${parseFloat(teacherData.base_pay || '0').toFixed(2)}
                          </p>
                        </div>
                        {/* <Button
                          onClick={() => handleViewProfile(teacher.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                        >
                          View Profile
                        </Button> */}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

