import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Footer from "@/components/shared/Footer"
import Hero from "@/components/Home/Hero"

export default function Home() {
  return (
    <>
    <div className="px-4 max-w-7xl mx-auto">
      <AppHeader />
      {/* Hero Section */}
      <Hero/>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50">
        <div className="container text-center">
          <p className="text-sm text-gray-500 mb-8">Trusted by leading publications</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {["Business Insider", "Wall Street Journal", "CNBC", "Fox", "TechCrunch", "Fortune"].map((publication) => (
              <span key={publication} className="text-sm font-medium text-gray-600">{publication}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
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

      {/* Never Played Before Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">Never played before?</h2>
            <p className="text-lg text-gray-600">Don&apos;t worry! Whether you&apos;re brand-new or highly experienced, our coaches can help you level up.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Corey J.",
                skill: "Pickleball",
                rating: 5,
                review: "My lesson with Mateo was my first time ever playing pickleball and he was an excellent coach. He was very patient, took time to answer questions, and had a nice plan for our lesson."
              },
              {
                name: "Jocolbe P.",
                skill: "Golf",
                rating: 5,
                review: "Charlotte was amazing. This was my very first time golfing and she made me feel very comfortable and she had lots of knowledge. I'd definitely recommend her to anyone wanting to learn."
              },
              {
                name: "Elson G.",
                skill: "Tennis",
                rating: 5,
                review: "I was pretty nervous coming in because I had never played tennis before but Armaan eased the environment so much and I actually learned more than I ever thought on my first session alone."
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Beginner</Badge>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">&ldquo;{testimonial.review}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.skill} Student</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">Everything you need to learn and teach</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* For Students */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🎓</span>
              </div>
              <h3 className="text-2xl font-bold text-primary">For Students</h3>
            </div>
            
            <div className="space-y-4">
              {[
                "1-on-1 & Group Learning - Book personalized or group sessions with experienced instructors",
                "Flexible Scheduling - Choose session times that fit your lifestyle",
                "HD Video Calls - Learn in real-time through seamless, high-quality video sessions",
                "Endless Skill Categories - From academics and fitness to music, business, art, and cooking",
                "Smart Search Filters - Discover teachers by skill, experience, or rating",
                "Student Points System - Earn points after each lesson for discounts",
                "Progress Tracker - Track completed lessons, achievements, and skill growth",
                "Secure Payments - Fast, transparent, and protected payment system"
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">{feature}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* For Teachers */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-bold text-primary">For Teachers</h3>
            </div>
            
            <div className="space-y-4">
              {[
                "Open to Everyone - No certification required, just real skills and passion to teach",
                "Public Instructor Profiles - Display your bio, video, experience, and specialties",
                "Fixed Base Pay + Automatic Raises - Earn higher pay as you advance 💰",
                "Performance-Based Progression - Increases through consistent quality and results",
                "Teacher Level Path - Bronze → Silver → Gold → Platinum → Master",
                "Video Lesson Uploads - Upload and sell recorded tutorials for additional income",
                "Earnings Dashboard - Track pay, level progress, and performance analytics",
                "Smart Schedule Manager - Control availability, bookings, and reminders"
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">🌐</span>
              <h2 className="text-4xl font-bold text-primary">Platform & System Features</h2>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🤖",
                title: "AI Matchmaking",
                description: "Automatically connects students to the most compatible teachers based on skill level and learning goals."
              },
              {
                icon: "📹",
                title: "Built-In HD Video",
                description: "No external software needed; learn and teach directly on Brain Bridge."
              },
              {
                icon: "🔒",
                title: "Secure Payment Gateway",
                description: "Instant, encrypted, and safe for all users."
              },
              {
                icon: "📊",
                title: "Dynamic Pay Algorithm",
                description: "Automatically adjusts pay according to teacher level, performance, and reviews."
              },
              {
                icon: "🏆",
                title: "Community Ranking",
                description: "Highlights top-tier teachers on the homepage and in search results."
              },
              {
                icon: "📱",
                title: "Mobile & Desktop",
                description: "Full functionality across all devices for teaching or learning on the go."
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div className="text-3xl">{feature.icon}</div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">61,312.</h2>
          <p className="text-lg text-gray-600">That&apos;s how many lessons we gave last year.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-secondary mb-2">250+</div>
            <p className="text-gray-600">Lessons delivered daily</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent mb-2">4.8★</div>
            <p className="text-gray-600">Average instructor rating</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-secondary mb-2">95%</div>
            <p className="text-gray-600">Student satisfaction rate</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-4xl font-bold">Get off the couch and learn something new!</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Learning new things is one of life&apos;s most rewarding experiences. Brain Bridge makes getting started easy.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-secondary hover:bg-orange-600 text-white">
              <Link href="/explore">Find Your Teacher</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Link href="/teachers">Start Teaching</Link>
            </Button>
          </div>
        </div>
      </section>

     
    </div>
     {/* Footer */}
     <Footer/>
    </>
  )
}