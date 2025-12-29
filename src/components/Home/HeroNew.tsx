import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight, Zap, Search } from 'lucide-react'

interface HeroProps {
  variant?: 'default' | 'landing'
}

export default function HeroNew({ variant = 'default' }: HeroProps) {
  const isLanding = variant === 'landing'
  
  if (isLanding) {
    return (
      <section className="relative w-full bg-gray-900 overflow-hidden">
        {/* Hero Background Image - Shorter height */}
        <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px]">
          <Image
            src="/images/hero/hero-3.png"
            alt="Learning collage"
            width={1920}
            height={1080}
            className="w-full h-full object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
            priority
            quality={95}
            style={{
              display: 'block',
            }}
          />
          
          {/* Dark overlay for better text readability - subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/50 z-10 pointer-events-none"></div>
          
          {/* Text Overlay - "Learn Anything. From Anyone. Anywhere." */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none ">
            <div className="text-center px-4 sm:px-6 md:px-8">
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight tracking-tight py-5"
                style={{
                  textShadow: '3px 3px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.7), 6px 6px 16px rgba(0,0,0,0.6)',
                  letterSpacing: '-0.02em',
                }}
              >
                Learn Anything.
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Teach What <br /> You Know.
              </h1>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 px-4 sm:px-0 pointer-events-auto">
                <Button asChild className="bg-purple-800 hover:bg-purple-900 text-white px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 text-base sm:text-lg md:text-xl font-medium w-full sm:w-auto">
                  <Link href="/courses" className="flex items-center justify-center gap-2">
                    Start Learning
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-2 border-white/20 text-black bg-white/60 hover:text-gray-900 hover:bg-white/80 px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 text-base sm:text-lg md:text-xl font-medium w-full sm:w-auto">
                  <Link href="/signup?role=master">Become a Master</Link>
                </Button>
              </div>
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
