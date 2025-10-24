import { AppHeader } from "@/components/app-header"
import Footer from "@/components/shared/Footer"
import Hero from "@/components/Home/Hero"
import ChooseUs from "@/components/Home/ChooseUs"
import OurFeature from "@/components/Home/OurFeature"
import FeaturedCourses from "@/components/Home/FeaturedCourses"
import Statistics from "@/components/Home/Statistics"
import StudentReview from "@/components/Reviews/StudentReview"
import Contact from "@/components/shared/Contact"

export default function Home() {
  return (
    <>
    <div className=" mx-auto">
      <AppHeader />
      {/* Hero Section */}
      <Hero/>
      {/* Platform Features */}
      <OurFeature/>

      {/* Trusted By Section */}
      {/* <Partner/> */}
      <FeaturedCourses/>
      {/* Why Choose Us Section */}
      <ChooseUs/>

    

      <StudentReview/>


      

      {/* Statistics Section */}
      <Statistics/>

      {/* CTA Section */}
      {/* <section className="py-20 bg-primary ">
        <div className="container text-center space-y-8">
          <h2 className="text-4xl font-bold">Get off the couch and learn something new!</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Learning new things is one of life&apos;s most rewarding experiences. Brain Bridge makes getting started easy.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-orange-600 text-white">
              <Link href="/explore">Find Your Teacher</Link>
            </Button>
            <Button asChild variant="outline" className="border-white bg-black text-white hover:text-primary">
              <Link href="/teachers">Start Teaching</Link>
            </Button>
          </div>
        </div>
      </section> */}
      <Contact/>
     
    </div>
     {/* Footer */}
     <Footer/>
    </>
  )
}