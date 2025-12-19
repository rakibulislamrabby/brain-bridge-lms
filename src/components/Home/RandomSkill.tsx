
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { AlertTriangle, Search, Shuffle } from 'lucide-react'
import { useSubjects } from '@/hooks/subject/use-subject'
import { useSkills, type SkillResponse } from '@/hooks/skills/use-skills'

interface SubjectInfo {
  id: number
  name: string
}

interface RandomSkillInfo {
  id: number
  name: string
  subjectName: string
  subjectId: number
}

export default function RandomSkill() {
  const router = useRouter()
  const { data: subjects = [], isLoading: isLoadingSubjects, isError: isSubjectsError, error: subjectsError } = useSubjects()
  const { data: skills = [], isLoading: isLoadingSkills, isError: isSkillsError, error: skillsError } = useSkills()
  const [selectedSkill, setSelectedSkill] = useState<RandomSkillInfo | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [randomizedSubjects, setRandomizedSubjects] = useState<SubjectInfo[]>([])

  const isLoading = isLoadingSubjects || isLoadingSkills
  const isError = isSubjectsError || isSkillsError
  const error = subjectsError || skillsError

  const normalizedSubjects = useMemo<SubjectInfo[]>(() => {
    if (!Array.isArray(subjects)) {
      return []
    }
    return subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
    }))
  }, [subjects])

  // Group skills by subject_id
  const skillsBySubject = useMemo(() => {
    if (!Array.isArray(skills)) {
      return new Map<number, SkillResponse[]>()
    }
    const grouped = new Map<number, SkillResponse[]>()
    skills.forEach((skill) => {
      const subjectId = skill.subject_id
      if (!grouped.has(subjectId)) {
        grouped.set(subjectId, [])
      }
      grouped.get(subjectId)!.push(skill)
    })
    return grouped
  }, [skills])

  // Randomize subjects when they are loaded
  useEffect(() => {
    if (normalizedSubjects.length > 0) {
      const shuffled = [...normalizedSubjects].sort(() => Math.random() - 0.5)
      setRandomizedSubjects(shuffled)
    }
  }, [normalizedSubjects])

  useEffect(() => {
    if (!isLoading && normalizedSubjects.length === 0) {
      setSelectedSkill(null)
      setSelectedSubjectId('')
    }
  }, [isLoading, normalizedSubjects.length])

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value
    setSelectedSubjectId(subjectId)
    
    if (subjectId && subjectId !== '') {
      const subjectIdNum = parseInt(subjectId, 10)
      const subject = normalizedSubjects.find(s => s.id === subjectIdNum)
      const subjectSkills = skillsBySubject.get(subjectIdNum) || []
      
      if (subject && subjectSkills.length > 0) {
        // Pick a random skill from this subject
        const randomSkill = subjectSkills[Math.floor(Math.random() * subjectSkills.length)]
        setSelectedSkill({
          id: randomSkill.id,
          name: randomSkill.name,
          subjectName: subject.name,
          subjectId: subject.id,
        })
      } else {
        setSelectedSkill(null)
      }
    } else {
      setSelectedSkill(null)
    }
  }

  const handleRandomize = () => {
    if (normalizedSubjects.length > 0 && skillsBySubject.size > 0) {
      // Get subjects that have skills
      const subjectsWithSkills = normalizedSubjects.filter(subject => 
        skillsBySubject.has(subject.id) && skillsBySubject.get(subject.id)!.length > 0
      )
      
      if (subjectsWithSkills.length > 0) {
        // Pick a random subject that has skills
        const randomSubject = subjectsWithSkills[Math.floor(Math.random() * subjectsWithSkills.length)]
        const subjectSkills = skillsBySubject.get(randomSubject.id) || []
        
        if (subjectSkills.length > 0) {
          // Pick a random skill from that subject
          const randomSkill = subjectSkills[Math.floor(Math.random() * subjectSkills.length)]
          setSelectedSkill({
            id: randomSkill.id,
            name: randomSkill.name,
            subjectName: randomSubject.name,
            subjectId: randomSubject.id,
          })
          setSelectedSubjectId(randomSubject.id.toString())
        }
      }
      
      // Also shuffle the dropdown list
      const shuffled = [...normalizedSubjects].sort(() => Math.random() - 0.5)
      setRandomizedSubjects(shuffled)
    }
  }

  const handleChooseSkill = () => {
    if (selectedSkill?.id) {
      router.push(`/masters?skill_id=${selectedSkill.id}`)
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
            Not sure what skill to tackle next? Select a subject from the catalog and discover tailored courses and mentors.
          </p>

          <div className="relative max-w-md mx-auto">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedSubjectId}
                onChange={handleSubjectChange}
                disabled={isLoading || normalizedSubjects.length === 0}
                className="w-full pl-12 pr-4 py-5 bg-gray-800 border-2 border-gray-700 rounded-2xl text-white text-lg font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            >
                <option value="">
                  {isLoading ? 'Loading subjects...' : normalizedSubjects.length === 0 ? 'No subjects available' : 'Select a subject to discover'}
                </option>
                {randomizedSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <Button
              onClick={handleRandomize}
              disabled={isLoading || normalizedSubjects.length === 0 || skillsBySubject.size === 0}
              className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              Get Random Skill
            </Button>
          </div>
        </div>

        {isError && (
          <div className="flex justify-center mb-8">
            <Card className="w-full max-w-lg bg-red-900/40 border border-red-700/60">
              <CardContent className="p-6 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Unable to load data</h3>
                  <p className="text-sm text-red-200/90">
                    {error instanceof Error ? error.message : 'Something went wrong while fetching the catalog.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {normalizedSubjects.length === 0 && !isLoading && !isError && (
          <div className="flex justify-center">
            <Card className="w-full max-w-lg bg-gray-800 border border-gray-700/80">
              <CardContent className="p-6 text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">No subjects available yet</h3>
                <p className="text-sm text-gray-300">
                  Once new subjects are added to the catalog, you will be able to discover them here.
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
                  <p className="text-sm text-purple-300 font-medium uppercase tracking-wide">
                    {selectedSkill.subjectName}
                  </p>
                </div>
                <p className="text-gray-300 text-sm">
                  Ready to master this skill? Explore tailored courses and mentors aligned with this skill.
                </p>
                <Button 
                  onClick={handleChooseSkill}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer w-full"
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
