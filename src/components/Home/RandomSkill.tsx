
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { AlertTriangle, Search } from 'lucide-react'
import { useSkills } from '@/hooks/skills/use-skills'

interface RandomSkillInfo {
  id: number
  name: string
  subjectName?: string | null
}

export default function RandomSkill() {
  const router = useRouter()
  const { data: skills = [], isLoading, isError, error } = useSkills()
  const [selectedSkill, setSelectedSkill] = useState<RandomSkillInfo | null>(null)
  const [selectedSkillId, setSelectedSkillId] = useState<string>('')

  const normalizedSkills = useMemo<RandomSkillInfo[]>(() => {
    if (!Array.isArray(skills)) {
      return []
    }
    return skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      subjectName: skill.subject?.name ?? null,
    }))
  }, [skills])

  useEffect(() => {
    if (!isLoading && normalizedSkills.length === 0) {
      setSelectedSkill(null)
      setSelectedSkillId('')
    }
  }, [isLoading, normalizedSkills.length])

  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skillId = e.target.value
    setSelectedSkillId(skillId)
    
    if (skillId && skillId !== '') {
      const skill = normalizedSkills.find(s => s.id.toString() === skillId)
      if (skill) {
        setSelectedSkill(skill)
      }
    } else {
      setSelectedSkill(null)
    }
  }

  return (
    <section className="relative pt-0 pb-16 sm:pb-20 lg:pb-24 bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-orange-500/10 to-blue-500/10"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full blur-lg"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <h2 className="text-4xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent leading-tight">
              DISCOVER SOMETHING NEW
            </h2>
          </div>

          <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
            Not sure what skill to tackle next? Select a skill from the catalog and discover tailored courses and mentors.
          </p>

          <div className="relative max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedSkillId}
                onChange={handleSkillChange}
                disabled={isLoading || normalizedSkills.length === 0}
                className="w-full pl-12 pr-4 py-5 bg-gray-800 border-2 border-gray-700 rounded-2xl text-white text-lg font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="">
                  {isLoading ? 'Loading skills...' : normalizedSkills.length === 0 ? 'No skills available' : 'Select a skill to discover'}
                </option>
                {normalizedSkills.map((skill) => (
                  <option key={skill.id} value={skill.id.toString()}>
                    {skill.name} {skill.subjectName ? `(${skill.subjectName})` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {isError && (
          <div className="flex justify-center mb-8">
            <Card className="w-full max-w-lg bg-red-900/40 border border-red-700/60">
              <CardContent className="p-6 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Unable to load skills</h3>
                  <p className="text-sm text-red-200/90">
                    {error instanceof Error ? error.message : 'Something went wrong while fetching the skill catalog.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {normalizedSkills.length === 0 && !isLoading && !isError && (
          <div className="flex justify-center">
            <Card className="w-full max-w-lg bg-gray-800 border border-gray-700/80">
              <CardContent className="p-6 text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">No skills available yet</h3>
                <p className="text-sm text-gray-300">
                  Once new skills are added to the catalog, you will be able to discover them here.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedSkill && (
          <div className="flex justify-center mt-8 transition-all duration-500 opacity-100 translate-y-0">
            <Card className="w-full max-w-md bg-gray-800 border border-gray-700 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {selectedSkill.name}
                  </h3>
                  {selectedSkill.subjectName && (
                    <p className="text-sm text-purple-300 font-medium uppercase tracking-wide">
                      {selectedSkill.subjectName}
                    </p>
                  )}
                </div>
                <p className="text-gray-300 text-sm">
                  Ready to master this? Explore tailored courses and mentors aligned with this skill.
                </p>
                <Button 
                  onClick={() => {
                    if (selectedSkill?.id) {
                      router.push(`/masters?skill_id=${selectedSkill.id}`)
                    }
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Find Master
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
