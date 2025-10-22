'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { ArrowRightIcon, Menu, X, LogOut, User, LayoutDashboard, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getStoredUser, clearAuthData } from "@/hooks/useAuth"

export function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set client flag to true after hydration
    setIsClient(true)
    // Check if user is logged in
    const storedUser = getStoredUser()
    setUser(storedUser)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    clearAuthData()
    setUser(null)
    window.location.href = '/signin'
  }

  const getUserInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U'
  }

  const getShortName = (name: string) => {
    if (!name) return 'User'
    const words = name.trim().split(' ')
    return words.length > 1 ? `${words[0]} ${words[1]}` : words[0]
  }

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen)
  }

  return (
    <header className="border-b bg-white/50 backdrop-blur-sm max-w-7xl mx-auto relative z-50">
      <div className="container flex h-12 sm:h-14 lg:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-primary">Brain Bridge</Link>
        
        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="text-sm lg:text-base font-medium">
                <Link href="/teacher">Teacher</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="text-sm lg:text-base font-medium">
                <Link href="/courses">Courses</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="text-sm lg:text-base font-medium">
                <Link href="/about">About</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="text-sm lg:text-base font-medium">
                <Link href="/contact">Contact Us</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          {!isClient ? (
            <Button asChild className="bg-orange-600 text-sm font-medium text-white py-2 px-3">
              <Link href="/signin" className="flex items-center gap-1">
                <span>Start</span>
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </Button>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleUserDropdown}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1 transition-colors"
              >
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {getUserInitial(user.name)}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {getShortName(user.name)}
                </span>
                {isUserDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {/* Mobile Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsUserDropdownOpen(false)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button asChild className="bg-orange-600 text-sm font-medium text-white py-2 px-3">
              <Link href="/signin" className="flex items-center gap-1">
                <span>Start</span>
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </Button>
          )}
          
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex gap-2">
          {!isClient ? (
            <Button asChild className="bg-orange-600 text-sm sm:text-base lg:text-lg font-medium text-white py-2 sm:py-3 lg:py-6 px-3 sm:px-4 lg:px-6">
              <Link href="/signin" className="flex items-center gap-1 sm:gap-2">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </Button>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleUserDropdown}
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center text-lg font-medium">
                  {getUserInitial(user.name)}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {getShortName(user.name)}
                </span>
                {isUserDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {/* Desktop Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsUserDropdownOpen(false)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button asChild className="bg-orange-600 text-sm sm:text-base lg:text-lg font-medium text-white py-2 sm:py-3 lg:py-6 px-3 sm:px-4 lg:px-6">
              <Link href="/signin" className="flex items-center gap-1 sm:gap-2">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/20 z-[9998]"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Content */}
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-xl z-[9999]">
            <div className="px-4 py-6 space-y-4">
            <Link
              href="/teacher"
              className="block py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium"
              onClick={closeMobileMenu}
            >
              Teacher
            </Link>
            <Link
              href="/courses"
              className="block py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium"
              onClick={closeMobileMenu}
            >
              Courses
            </Link>
            <Link
              href="/about"
              className="block py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium"
              onClick={closeMobileMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium"
              onClick={closeMobileMenu}
            >
              Contact Us
            </Link>
            
            {/* Mobile User Section or CTA Button */}
            <div className="pt-4 border-t">
              {!isClient ? (
                <Button asChild className="w-full bg-orange-600 text-white py-3 font-medium">
                  <Link href="/signin" className="flex items-center justify-center gap-2" onClick={closeMobileMenu}>
                    Get Started
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </Button>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center text-lg font-medium">
                      {getUserInitial(user.name)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {getShortName(user.name)}
                    </span>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      closeMobileMenu()
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Button asChild className="w-full bg-orange-600 text-white py-3 font-medium">
                  <Link href="/signin" className="flex items-center justify-center gap-2" onClick={closeMobileMenu}>
                    Get Started
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
