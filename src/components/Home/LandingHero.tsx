'use client'

import { AppHeader } from "@/components/app-header"
import HeroNew from "./HeroNew"

export default function LandingHero() {
  return (
    <div className="relative w-full bg-gray-900">
      {/* Header - completely separate from image */}
      <div className="relative z-50 bg-gray-900">
        <AppHeader variant="landing" />
      </div>
      
      {/* Hero with background image and search bar - separate section */}
      <div className="relative w-full">
        <HeroNew variant="landing" />
      </div>
    </div>
  )
}

