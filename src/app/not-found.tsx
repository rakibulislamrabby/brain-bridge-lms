'use client'

import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <>
    <AppHeader />
      <div className="px-4 mx-auto bg-gray-900 min-h-screen flex flex-col">
        
        
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="max-w-7xl mx-auto w-full px-4">
            <div className="text-center">
            {/* 404 Number */}
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-orange-500">
                404
              </h1>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Page Not Found
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
                Let&apos;s get you back on track.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer">
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-700 text-white hover:bg-gray-800 cursor-pointer"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/courses"
                className="group p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-purple-500/50 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Search className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                      Browse Courses
                    </h3>
                    <p className="text-sm text-gray-400">
                      Explore our course catalog
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/how-it-works"
                className="group p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-purple-500/50 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <HelpCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                      How It Works
                    </h3>
                    <p className="text-sm text-gray-400">
                      Learn about our platform
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
