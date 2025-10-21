import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="mx-auto max-w-7xl py-14">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Content */}
        <div className="space-y-8">
          {/* Rating Section */}
          <div className="flex items-center gap-2 text-left">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
              <span className="text-gray-700 font-medium">5 Stars</span>
            </div>
            <Link href="/success-stories" className="text-gray-500 hover:text-gray-700 text-sm ml-4">
              Read Our Success Stories
            </Link>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Find Your
              <br />
              Perfect Learn
              <br />
              <span>Platform</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg">
              Our mission is to help people to help people to find the best course online and learn with expert anytime, anywhere
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 text-left">
            <Button asChild className="bg-orange-600 text-white px-8 py-6 text-lg">
              <Link href="/signup" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-300 text-gray-700 px-8 py-6 text-lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>

         {/* Right Side - Images */}
         <div className="relative">
           <div className="flex justify-center items-start gap-6">
             {/* First Person Image - Slightly lower */}
             <div className="relative mt-8">
               <Image
                 src="/images/person/p-1.png"
                 alt="Student with books"
                 width={400}
                 height={400}
                 className="w-64 h-96"
               />
             </div>

             {/* Second Person Image - Slightly higher */}
             <div className="relative -mt-4">
               <Image
                 src="/images/person/p-2.png"
                 alt="Student with notebook"
                 width={400}
                 height={400}
                 className="w-64 h-96"
               />
             </div>
           </div>

          {/* Decorative Background Elements */}
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-100 rounded-full opacity-30 -z-10"></div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-100 rounded-full opacity-30 -z-10"></div>
          <div className="absolute top-1/2 -right-8 w-16 h-16 bg-teal-100 rounded-full opacity-20 -z-10"></div>
        </div>
      </div>
    </section>
  )
}
