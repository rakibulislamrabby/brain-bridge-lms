import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight } from 'lucide-react'

interface HeroProps {
  variant?: 'default' | 'landing'
}

export default function Hero({ variant = 'default' }: HeroProps) {
  const isLanding = variant === 'landing'
  
  if (isLanding) {
    return (
      <section className="relative min-h-[600px] sm:min-h-[700px] lg:min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Hero Background Image */}
          <div className="relative w-full h-full"> 
            <Image
              src="/images/hero/hero-2.png"
              alt="Learning collage"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
          
          {/* Dark overlay for better text readability */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-gray-900/60 z-10"></div> */}
          
          {/* Purple gradient overlay in center */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/20 to-transparent z-20"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center space-y-8 sm:space-y-12">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Learn Anything.
              <br />
              From Anyone.
              <br />
              Anywhere.
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Button asChild className="bg-purple-800 hover:bg-purple-900 text-white px-10 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-medium">
                <Link href="/signup" className="flex items-center gap-2">
                  Start Learning
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-white/20 text-black bg-white/60 hover:text-gray-900 hover:bg-white/80 px-10 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl font-medium">
                <Link href="/teacher">Become a Master</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Default Hero (original design)
  return (
    <section className="mx-auto max-w-7xl py-8 sm:py-12 lg:py-10 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
        {/* Left Side - Content */}
        <div className="space-y-4 sm:space-y-8 order-2 lg:order-1">
          {/* Rating Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 text-left">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-purple-500 text-purple-500" />
              <span className="text-white font-medium text-sm sm:text-base">5 Stars</span>
            </div>
            <Link href="/success-stories" className="text-gray-300 hover:text-white text-xs sm:text-sm">
              Read Our Success Stories
            </Link>
          </div>

          {/* Main Heading */}
          <div className="space-y-3 sm:space-y-6 text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight uppercase tracking-wide">
              Connect Minds, Share Skills,
              <br />
              Transform Learning
              <br />
              <span className="text-purple-500 ">Experiences</span>
            </h1>
            <div className="space-y-2">
              <p className="text-base sm:text-lg text-white/70 font-semibold uppercase tracking-wide">
                Flexible Learning
              </p>
              <p className="text-sm sm:text-base text-white/70 uppercase tracking-wide">
                In-Person • Video • Recorded
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-left">
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg">
              <Link href="/signup" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-300 text-white px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>

         {/* Right Side - Images */}
         <div className="relative order-1 lg:order-2">
           <div className="flex justify-center items-start gap-3 sm:gap-4 lg:gap-6">
             {/* First Person Image - Slightly lower */}
             <div className="relative mt-4 sm:mt-6 lg:mt-8">
               <Image
                 src="/images/person/p-1.png"
                 alt="Student with books"
                 width={400}
                 height={400}
                 className="w-48 h-72 sm:w-56 sm:h-80 lg:w-64 lg:h-96"
               />
             </div>

             {/* Second Person Image - Slightly higher */}
             <div className="relative -mt-2 sm:-mt-3 lg:-mt-4">
               <Image
                 src="/images/person/p-2.png"
                 alt="Student with notebook"
                 width={400}
                 height={400}
                 className="w-48 h-72 sm:w-56 sm:h-80 lg:w-64 lg:h-96"
               />
             </div>
           </div>

          {/* Decorative Background Elements */}
          <div className="absolute -top-2 sm:-top-3 lg:-top-4 -left-2 sm:-left-3 lg:-left-4 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-blue-100 rounded-full opacity-30 -z-10"></div>
          <div className="absolute -bottom-2 sm:-bottom-3 lg:-bottom-4 -right-2 sm:-right-3 lg:-right-4 w-12 h-12 sm:w-18 sm:h-18 lg:w-24 lg:h-24 bg-orange-100 rounded-full opacity-30 -z-10"></div>
          <div className="absolute top-1/2 -right-4 sm:-right-6 lg:-right-8 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-teal-100 rounded-full opacity-20 -z-10"></div>
        </div>
      </div>
    </section>
  )
}
