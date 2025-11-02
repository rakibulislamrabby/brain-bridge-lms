import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-16 px-10">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-3xl font-bold mb-4">BrainBridge</h3>
              <p className="text-gray-400">The easy way to learn and teach anything.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-gray-400">
                {/* <li><Link href="/explore" className="hover:text-white">Find Masters</Link></li> */}
                <li><Link href="/categories" className="hover:text-white">Browse Skills</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Masters</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/teachers" className="hover:text-white">Apply to Teach</Link></li>
                <li><Link href="/teacher-dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/teacher-resources" className="hover:text-white">Resources</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Brain Bridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
  )
}
