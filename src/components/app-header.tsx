'use client'

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { ArrowRightIcon, Menu, X, LogOut, User, LayoutDashboard, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getStoredUser, clearAuthData } from "@/hooks/useAuth"
import { useMe } from "@/hooks/use-me"
import { useQueryClient } from "@tanstack/react-query"

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_MAIN_STORAGE_URL || ''

const resolveProfilePictureUrl = (path?: string | null): string | null => {
  if (!path || typeof path !== 'string') {
    return null
  }

  // If already a full URL, return as is
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  // Prepend storage base URL
  const base = STORAGE_BASE_URL.endsWith('/') ? STORAGE_BASE_URL.slice(0, -1) : STORAGE_BASE_URL
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${cleanedPath}`
}

interface AppHeaderProps {
  variant?: 'default' | 'landing'
}

export function AppHeader({ variant = 'default' }: AppHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const desktopDropdownRef = useRef<HTMLDivElement>(null)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)
  const isLanding = variant === 'landing'

  const router = useRouter()
  const queryClient = useQueryClient()
  
  // Fetch full user profile including profile_picture
  const { data: userProfile, isLoading: isLoadingUser } = useMe()
  
  // Get user data - prefer API data, fallback to stored user
  const user = userProfile || (isClient ? getStoredUser() : null)

  // Detect client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Close dropdown when clicking outside - using click event instead of mousedown
  useEffect(() => {
    if (!isUserDropdownOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isDesktopClick = desktopDropdownRef.current?.contains(target)
      const isMobileClick = mobileDropdownRef.current?.contains(target)
      
      // Only close if click is outside both dropdowns
      if (!isDesktopClick && !isMobileClick) {
        setIsUserDropdownOpen(false)
      }
    }

    // Use a small delay to allow click events to process first
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [isUserDropdownOpen])


  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen)

  // ✅ No timeout hacks anymore
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsUserDropdownOpen(false)
    clearAuthData(queryClient)
    setTimeout(() => {
      router.push('/signin')
    }, 10)
  }

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Close dropdown first, then navigate
    setIsUserDropdownOpen(false)
    // Small delay to ensure dropdown closes before navigation
    setTimeout(() => {
      router.push('/dashboard')
    }, 10)
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsUserDropdownOpen(false)
    setTimeout(() => {
      router.push('/profile')
    }, 10)
  }

  const getUserInitial = (name: string) => {
    if (!name || typeof name !== 'string') return 'U'
    return name.trim().charAt(0).toUpperCase()
  }
  
  const getShortName = (name: string) => {
    if (!name || typeof name !== 'string') return 'User'
    const trimmedName = name.trim()
    if (!trimmedName) return 'User'
    const words = trimmedName.split(' ')
    return words.length > 1 ? `${words[0]} ${words[1]}` : words[0]
  }
  
  // Get display name from user object
  const getUserDisplayName = () => {
    if (!user) return 'User'
    return user.name || user.email?.split('@')[0] || 'User'
  }

  return (
    <header className={`${isLanding ? 'bg-transparent' : 'border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm'} max-w-7xl mx-auto relative z-50`}>
      <div className="container flex h-12 sm:h-14 md:h-14 lg:h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        <Link href="/" className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-white">BrainBridge</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <NavigationMenu>
            <NavigationMenuList className="gap-2 lg:gap-0">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="text-sm md:text-sm lg:text-base font-medium text-white hover:text-purple-400 transition-colors px-2 lg:px-3">
                  <Link href="/courses">Courses</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="text-sm md:text-sm lg:text-base font-medium text-white hover:text-purple-400 transition-colors px-2 lg:px-3">
                  <Link href="/how-it-works">How It Works</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="text-sm md:text-sm lg:text-base font-medium text-white hover:text-purple-400 transition-colors px-2 lg:px-3">
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="text-sm md:text-sm lg:text-base font-medium text-white hover:text-purple-400 transition-colors px-2 lg:px-3">
                  <Link href="/contact">Contact Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right-side Auth / Dropdown */}
          {!isClient ? (
            <div className="flex items-center gap-2 lg:gap-3">
              <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-xs md:text-sm font-medium py-1.5 md:py-2 px-2 md:px-3 lg:px-4">
                <Link href="/signup?role=master" className="whitespace-nowrap">Master</Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-xs md:text-sm font-medium py-1.5 md:py-2 px-2 md:px-3 lg:px-4 hidden lg:inline-flex">
                <Link href="/signup">Student</Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm font-medium py-1.5 md:py-2 px-2 md:px-3 lg:px-4">
                <Link href="/signin" className="whitespace-nowrap">Sign In</Link>
              </Button>
            </div>
          ) : user ? (
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleUserDropdown()
                }}
                className="flex items-center gap-3 hover:bg-gray-700 rounded-lg p-2 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-medium overflow-hidden flex-shrink-0">
                  {user?.profile_picture ? (
                    <Image
                      src={resolveProfilePictureUrl(user.profile_picture) || ''}
                      alt={user.name || 'Profile'}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-lg font-medium">
                      {getUserInitial(getUserDisplayName())}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-white">
                  {getShortName(getUserDisplayName())}
                </span>
                {isUserDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                )}
              </button>

              {/* Desktop Dropdown */}
              {isUserDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-[9999]"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-2">
                    {/* <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </button> */}
                    <button
                      onClick={handleDashboardClick}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 w-full text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 lg:gap-3">
              <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-xs md:text-sm font-medium py-1.5 md:py-2 px-2 md:px-3 lg:px-4">
                <Link href="/signup?role=master" className="whitespace-nowrap">Master</Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-xs md:text-sm font-medium py-1.5 md:py-2 px-2 md:px-3 lg:px-4 hidden lg:inline-flex">
                <Link href="/signup">Student</Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm font-medium py-1.5 md:py-2 px-2 md:px-3 lg:px-4">
                <Link href="/signin" className="whitespace-nowrap">Sign In</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          {!isClient ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="border border-white text-white hover:bg-white/10 text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-2 sm:px-3">
                <Link href="/signup?role=master">Master</Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-2 sm:px-3">
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          ) : user ? (
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleUserDropdown()
                }}
                className="flex items-center gap-2 hover:bg-gray-700 rounded-lg p-1 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium overflow-hidden flex-shrink-0">
                  {user?.profile_picture ? (
                    <Image
                      src={resolveProfilePictureUrl(user.profile_picture) || ''}
                      alt={user.name || 'Profile'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {getUserInitial(getUserDisplayName())}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-white hidden sm:block">
                  {getShortName(getUserDisplayName())}
                </span>
                {isUserDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                )}
              </button>

              {/* Mobile Dropdown */}
              {isUserDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-[9999]"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button
                      onClick={handleDashboardClick}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="border border-white text-white hover:bg-white/10 text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-2 sm:px-3">
                <Link href="/signup?role=master">Master</Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-2 sm:px-3">
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          )}

          <button
            onClick={toggleMobileMenu}
            className="p-1.5 sm:p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/20 z-[9998]"
            onClick={closeMobileMenu}
          />
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800 border-b shadow-xl z-[9999]">
            <div className="px-4 py-6 space-y-4">
              <Link href="/courses" className="block py-2 text-white hover:text-purple-400 transition-colors font-medium" onClick={closeMobileMenu}>Courses</Link>
              <Link href="/how-it-works" className="block py-2 text-white hover:text-purple-400 transition-colors font-medium" onClick={closeMobileMenu}>How It Works</Link>
              <Link href="/signup?role=master" className="block py-2 text-white hover:text-purple-400 transition-colors font-medium" onClick={closeMobileMenu}>Become a Master</Link>
              <Link href="/about" className="block py-2 text-white hover:text-purple-400 transition-colors font-medium" onClick={closeMobileMenu}>About</Link>
              <Link href="/contact" className="block py-2 text-white hover:text-purple-400 transition-colors font-medium" onClick={closeMobileMenu}>Contact Us</Link>

              <div className="pt-4 border-t">
                {!isClient ? (
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 font-medium">
                      <Link href="/signin" onClick={closeMobileMenu}>Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-sm font-medium py-2 border-2 border-white text-white hover:bg-white/10">
                      <Link href="/signup?role=master" onClick={closeMobileMenu}>Become a Master</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-sm font-medium py-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                      <Link href="/signup" onClick={closeMobileMenu}>Become a Student</Link>
                    </Button>
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-medium overflow-hidden flex-shrink-0">
                        {user?.profile_picture ? (
                          <Image
                            src={resolveProfilePictureUrl(user.profile_picture) || ''}
                            alt={user.name || 'Profile'}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-lg font-medium">
                            {getUserInitial(getUserDisplayName())}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-white">{getShortName(getUserDisplayName())}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileMenu()
                        handleProfileClick(e)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-lg w-full text-left transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileMenu()
                        handleDashboardClick(e)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-lg w-full text-left transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileMenu()
                        handleLogout(e)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 font-medium">
                      <Link href="/signin" onClick={closeMobileMenu}>Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-sm font-medium py-2 border-2 border-white text-white hover:bg-white/10">
                      <Link href="/signup?role=master" onClick={closeMobileMenu}>Become a Master</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-sm font-medium py-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                      <Link href="/signup" onClick={closeMobileMenu}>Become a Student</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
