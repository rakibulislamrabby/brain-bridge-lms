'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { ArrowRightIcon, Menu, X, LogOut, User, LayoutDashboard, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getStoredUser, clearAuthData } from "@/hooks/useAuth"

interface AppHeaderProps {
  variant?: 'default' | 'landing'
}

export function AppHeader({ variant = 'default' }: AppHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const desktopDropdownRef = useRef<HTMLDivElement>(null)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)
  const isLanding = variant === 'landing'

  const router = useRouter()

  // Detect client & load user
  useEffect(() => {
    setIsClient(true)
    const storedUser = getStoredUser()
    setUser(storedUser)
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
    clearAuthData()
    setUser(null)
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

  const getUserInitial = (name: string) => name ? name.charAt(0).toUpperCase() : 'U'
  const getShortName = (name: string) => {
    if (!name) return 'User'
    const words = name.trim().split(' ')
    return words.length > 1 ? `${words[0]} ${words[1]}` : words[0]
  }

  return (
    <header className={`${isLanding ? 'bg-transparent' : 'border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm'} max-w-7xl mx-auto relative z-50`}>
      <div className="container flex h-12 sm:h-14 lg:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-white">BrainBridge</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              {/* <NavigationMenuItem>
                <NavigationMenuLink asChild className="text-sm lg:text-base font-medium text-white hover:text-purple-400 transition-colors">
                  <Link href="/teacher">Master</Link>
                </NavigationMenuLink>
              </NavigationMenuItem> */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="text-sm lg:text-base font-medium text-white hover:text-purple-400 transition-colors">
                  <Link href="/courses">Vedio Courses</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="text-sm lg:text-base font-medium text-white hover:text-purple-400 transition-colors">
                  <Link href="/live-session">Live Session</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="text-sm lg:text-base font-medium text-white hover:text-purple-400 transition-colors">
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="text-sm lg:text-base font-medium text-white hover:text-purple-400 transition-colors">
                  <Link href="/contact">Contact Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right-side Auth / Dropdown */}
          {!isClient ? (
            <Button asChild className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 text-sm font-medium py-2 px-4">
              <Link href="/signin">Sign In</Link>
            </Button>
          ) : user ? (
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleUserDropdown()
                }}
                className="flex items-center gap-3 hover:bg-gray-700 rounded-lg p-2 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-medium">
                  {getUserInitial(user.name)}
                </div>
                <span className="text-sm font-medium text-white">
                  {getShortName(user.name)}
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
            <Button asChild className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 text-sm font-medium py-2 px-4">
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          {!isClient ? (
            <Button asChild className="bg-transparent border border-white text-white hover:bg-white hover:text-gray-900 text-sm font-medium py-2 px-3">
              <Link href="/signin">Sign In</Link>
            </Button>
          ) : user ? (
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleUserDropdown()
                }}
                className="flex items-center gap-2 hover:bg-gray-700 rounded-lg p-1 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {getUserInitial(user.name)}
                </div>
                <span className="text-sm font-medium text-white hidden sm:block">
                  {getShortName(user.name)}
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
            <Button asChild className="bg-transparent border border-white text-white hover:bg-white hover:text-gray-900 text-sm font-medium py-2 px-3">
              <Link href="/signin">Sign In</Link>
            </Button>
          )}

          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
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
              <Link href="/about" className="block py-2 text-white hover:text-purple-400 transition-colors font-medium" onClick={closeMobileMenu}>About</Link>
              <Link href="/contact" className="block py-2 text-white hover:text-purple-400 transition-colors font-medium" onClick={closeMobileMenu}>Contact Us</Link>

              <div className="pt-4 border-t">
                {!isClient ? (
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full text-sm font-medium py-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                      <Link href="/signin" onClick={closeMobileMenu}>Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-sm font-medium py-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                      <Link href="/signup" onClick={closeMobileMenu}>Become a Student</Link>
                    </Button>
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 font-medium">
                      <Link href="/teacher" onClick={closeMobileMenu}>Become a Master</Link>
                    </Button>
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-medium">
                        {getUserInitial(user.name)}
                      </div>
                      <span className="text-sm font-medium text-white">{getShortName(user.name)}</span>
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
                    <Button asChild variant="outline" className="w-full text-sm font-medium py-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                      <Link href="/signin" onClick={closeMobileMenu}>Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-sm font-medium py-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                      <Link href="/signup" onClick={closeMobileMenu}>Become a Student</Link>
                    </Button>
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 font-medium">
                      <Link href="/teacher" onClick={closeMobileMenu}>Become a Master</Link>
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
