'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useMemo, Suspense, useState, useEffect } from 'react'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTeachers } from '@/hooks/teacher/use-teachers'
import { useSkills } from '@/hooks/skills/use-skills'
import { ArrowLeft, Star, Users, Award, Loader2, Search } from 'lucide-react'
import Image from 'next/image'

function MastersPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput)
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timer)
  }, [searchInput])
  
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

  // Filter teachers by skill - match teachers who have the selected skill by NAME
  const skillFilteredTeachers = useMemo(() => {
    // If no skillId is selected or no selected skill found, return all teachers
    if (!skillId || !selectedSkill || !allTeachers.length) {
      return allTeachers
    }
    
    const selectedSkillName = selectedSkill.name.trim().toLowerCase()
    
    const filtered = allTeachers.filter((teacher) => {
      // Check if teacher has teacher object
      if (!teacher?.teacher) {
        return false
      }
      
      const teacherData = teacher.teacher
      
      // Check if teacher has skills array
      if (!teacherData.skills || !Array.isArray(teacherData.skills) || teacherData.skills.length === 0) {
        return false
      }
      
      // Check if any skill matches the selected skill by NAME (case-insensitive)
      const hasMatchingSkill = teacherData.skills.some(skill => {
        if (!skill || !skill.name) {
          return false
        }
        
        const teacherSkillName = skill.name.trim().toLowerCase()
        return teacherSkillName === selectedSkillName
      })
      
      return hasMatchingSkill
    })
    
    return filtered
  }, [allTeachers, skillId, selectedSkill])

  // Apply search filter on top of skill filter
  const teachers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return skillFilteredTeachers
    }

    const searchLower = debouncedSearchTerm.trim().toLowerCase()
    
    return skillFilteredTeachers.filter((teacher) => {
      if (!teacher?.teacher) return false
      
      const teacherData = teacher.teacher
      
      // Search in teacher name
      const nameMatch = teacher.name?.toLowerCase().includes(searchLower) || false
      
      // Search in teacher title
      const titleMatch = teacherData.title?.toLowerCase().includes(searchLower) || false
      
      // Search in teacher bio
      const bioMatch = teacher.bio?.toLowerCase().includes(searchLower) || false
      
      // Search in skill names
      const skillsMatch = teacherData.skills?.some(skill => 
        skill.name?.toLowerCase().includes(searchLower)
      ) || false
      
      return nameMatch || titleMatch || bioMatch || skillsMatch
    })
  }, [skillFilteredTeachers, debouncedSearchTerm])

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

          {/* Professional Header Section */}
          <div className="mb-10">
            <div className="relative">
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-orange-500/10 to-blue-500/10 rounded-2xl blur-3xl -z-10"></div>
              
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    {selectedSkill ? (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-purple-600/20 text-purple-300 border border-purple-600/40 px-3 py-1">
                            {selectedSkill.name}
                          </Badge>
                          {selectedSkill.subject?.name && (
                            <Badge variant="outline" className="border-gray-600 text-gray-400">
                              {selectedSkill.subject.name}
                            </Badge>
                          )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                          Expert Masters
                        </h1>
                        <p className="text-gray-400 text-lg">
                          Discover skilled professionals ready to guide your learning journey
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-6 h-6 text-purple-400" />
                          <Badge className="bg-purple-600/20 text-purple-300 border border-purple-600/40 px-3 py-1">
                            All Experts
                          </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                          Discover Masters
                        </h1>
                        <p className="text-gray-400 text-lg">
                          Explore our community of verified experts and mentors
                        </p>
                      </>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">
                          <span className="text-purple-400 font-bold">{teachers.length}</span> {teachers.length === 1 ? 'master' : 'masters'} available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Search Bar */}
          <div className="mb-8">
            <div className="relative group">
              {/* Search bar glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              
              <div className="relative bg-gray-800/80 border border-gray-700/50 rounded-xl p-1 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 focus-within:border-purple-500 focus-within:shadow-purple-500/20 focus-within:shadow-xl">
                <div className="relative flex items-center">
                  <div className="absolute left-4 z-10">
                    <Search className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                  </div>
                  <Input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search masters by name, title, skills, or bio..."
                    className="pl-12 pr-4 py-4 bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput('')}
                      className="absolute right-3 p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                      aria-label="Clear search"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
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
          ) : teachers.length === 0 ? (
            <Card className="bg-gray-800/80 border border-gray-700 text-center">
              <CardContent className="py-16 space-y-3">
                <Users className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">No masters found</h3>
                <p className="text-gray-400">
                  {skillId 
                    ? debouncedSearchTerm
                      ? `No masters found for "${debouncedSearchTerm}" in this skill category.`
                      : `There are no masters available for this skill yet. Check back later!`
                    : debouncedSearchTerm
                      ? `No masters found for "${debouncedSearchTerm}".`
                      : 'There are no masters available yet.'}
                </p>
                {debouncedSearchTerm && (
                  <Button 
                    onClick={() => setSearchInput('')} 
                    variant="outline"
                    className="border-purple-400 text-purple-300 hover:bg-purple-900/30 mt-4"
                  >
                    Clear Search
                  </Button>
                )}
                <Button onClick={() => router.back()} className="bg-purple-600 hover:bg-purple-700 text-white mt-2">
                  Go back
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => {
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

                      {teacherData.skills && teacherData.skills.length > 0 && (
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
                      )}

                      
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

export default function MastersPage() {
  return (
    <Suspense fallback={
      <div>
        <AppHeader />
        <main className="bg-gray-900 min-h-screen py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <MastersPageContent />
    </Suspense>
  )
}

