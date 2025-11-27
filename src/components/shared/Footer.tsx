import Link from 'next/link'
import React from 'react'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  MessageCircle,
  HelpCircle,
  GraduationCap,
  Users,
  Gift
} from 'lucide-react'

export default function Footer() {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ]

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">BrainBridge</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The easy way to learn and teach anything. Connect with expert masters for personalized learning experiences.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-4 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-purple-600 flex items-center justify-center transition-colors duration-300 group"
                  >
                    <Icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                  </a>
                )
              })}
            </div>

            {/* Become a Master CTA */}
            <Link
              href="/signup?role=master"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-300"
            >
              <GraduationCap className="w-4 h-4" />
              Become a Master
            </Link>
          </div>

          {/* For Students Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              For Students
            </h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  Live Sessions
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  Browse Skills
                </Link>
              </li>
              <li>
                <Link href="/masters" className="hover:text-white transition-colors">
                  Masters
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Resources Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              Support
            </h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/referral" className="hover:text-white transition-colors flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Referral Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company Column */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/signup?role=master" className="hover:text-white transition-colors flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Become a Master
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} BrainBridge. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}