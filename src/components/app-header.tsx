import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { ArrowRightIcon } from "lucide-react"

export function AppHeader() {
  return (
    <header className="border-b  max-w-7xl mx-auto">
      <div className="container flex h-10 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">Brain Bridge</Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="text-lg font-medium">
                <Link href="/teacher">Teacher</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="text-lg font-medium">
                <Link href="/explore">Explore</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="text-lg font-medium">
                <Link href="/about">About</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className="text-lg font-medium">
                <Link href="/contact">Contact Us</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex gap-2">
          <Button asChild className="bg-orange-600 text-lg font-medium text-white py-6">
            <Link href="/signin" className="flex items-center gap-2">
              Get Started
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
