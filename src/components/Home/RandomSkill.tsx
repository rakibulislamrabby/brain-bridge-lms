
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Shuffle, ArrowRight, AlertTriangle } from 'lucide-react'
import { useSkills } from '@/hooks/skills/use-skills'

interface RandomSkillInfo {
  id: number
  name: string
  subjectName?: string | null
}

export default function RandomSkill() {
  const { data: skills = [], isLoading, isError, error } = useSkills()
  const [randomSkill, setRandomSkill] = useState<RandomSkillInfo | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)

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
      setRandomSkill(null)
      setShowResult(false)
    }
  }, [isLoading, normalizedSkills.length])

  const generateRandomSkill = () => {
    if (normalizedSkills.length === 0) {
      return
    }

    setIsGenerating(true)
    setShowResult(false)

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * normalizedSkills.length)
      setRandomSkill(normalizedSkills[randomIndex])
      setIsGenerating(false)
      setShowResult(true)
    }, 1200)
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
            Not sure what skill to tackle next? Let our intelligent generator pick one from the latest catalog and kickstart your learning streak.
          </p>

          <div className="relative inline-block">
            <Button
              onClick={generateRandomSkill}
              disabled={isGenerating || normalizedSkills.length === 0 || isLoading}
              className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 border-0 overflow-hidden cursor-pointer disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-center space-x-3">
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>GENERATING...</span>
                  </>
                ) : (
                  <>
                    <Shuffle className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    <span>{isLoading ? 'LOADING SKILLS...' : 'GENERATE RANDOM SKILL'}</span>
                    {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />}
                  </>
                )}
              </div>
            </Button>
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

        {randomSkill && (
          <div className={`flex justify-center transition-all duration-500 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="w-full max-w-md bg-gray-800 border border-gray-700 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {randomSkill.name}
                  </h3>
                  {randomSkill.subjectName && (
                    <p className="text-sm text-purple-300 font-medium uppercase tracking-wide">
                      {randomSkill.subjectName}
                    </p>
                  )}
                </div>
                <p className="text-gray-300 text-sm">
                  Ready to master this? Explore tailored courses and mentors aligned with this skill.
                </p>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer">
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
