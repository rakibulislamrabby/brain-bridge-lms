'use client'

import { AppHeader } from "@/components/app-header"
import Hero from "@/components/Home/Hero"

export default function LandingHero() {
  return (
    <div className="relative w-full min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
      {/* Header overlaying the hero */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <AppHeader variant="landing" />
      </div>
      
      {/* Hero with background */}
      <div className="relative">
        <Hero variant="landing" />
      </div>
    </div>
  )
}

