import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export default function ChooseUs() {
  return (
    <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">Why book with us?</h2>
          <p className="text-lg text-gray-600">Click to find instructors 👀 See for yourself →</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <CardTitle>Expert Instructors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Learn from verified professionals with real-world experience and proven teaching methods.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <CardTitle>Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Book sessions that fit your schedule with our smart calendar system and instant confirmation.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <CardTitle>Secure & Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Protected payments, verified instructors, and a safe learning environment for everyone.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

  )
}
