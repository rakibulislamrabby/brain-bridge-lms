import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="container py-20 text-center space-y-8">
    <div className="space-y-6">
      <h1 className="text-6xl font-bold text-primary leading-tight">
        DON&apos;T JUST DREAM.
        <br />
        <span className="text-secondary">DO.</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Learn something new with personalized 1-on-1 and group sessions from expert instructors.
      </p>
    </div>
    
    {/* Search Section */}
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Learn something new" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Near your location" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <Button className="bg-secondary hover:bg-orange-600 text-white px-8">
          Search for instructors
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        Or <Link href="/contact" className="text-secondary hover:underline">talk to a lesson coordinator</Link>
      </p>
    </div>
  </section>
  )
}
