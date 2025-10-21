import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Footer from "@/components/shared/Footer"
import Hero from "@/components/Home/Hero"
import Partner from "@/components/Home/Partner"
import ChooseUs from "@/components/Home/ChooseUs"
import OurFeature from "@/components/Home/OurFeature"

export default function Home() {
  return (
    <>
    <div className="px-4 mx-auto">
      <AppHeader />
      {/* Hero Section */}
      <Hero/>
      {/* Platform Features */}
      <OurFeature/>
      {/* Trusted By Section */}
      {/* <Partner/> */}

      {/* Why Choose Us Section */}
      <ChooseUs/>

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