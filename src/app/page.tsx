import Footer from "@/components/shared/Footer"
import LandingHero from "@/components/Home/LandingHero"
import ChooseUs from "@/components/Home/ChooseUs"
import OurFeature from "@/components/Home/OurFeature"
import AllCourse from "@/components/Courses/AllCourse"
import LiveSessions from "@/components/Home/LiveSessions"
import InPersonSessions from "@/components/Home/InPersonSessions"
import LearningReimagined from "@/components/Reviews/LearningReimagined"
import PointSystem from "@/components/Point/PointSystem"
import Contact from "@/components/shared/Contact"
import RandomSkill from "@/components/Home/RandomSkill"
import OnBordingStep from "@/components/Home/OnBordingStep"

export default function Home() {
  return (
    <>
    <div className=" mx-auto">
      <LandingHero />
      <LearningReimagined/>
      <OnBordingStep/>
      <RandomSkill/>
      <AllCourse/>
      <LiveSessions limit={6} showShowMore={true} />
      <InPersonSessions limit={6} showShowMore={true} />
      <ChooseUs/>
      <PointSystem/>
      <Contact/> 
    </div>
     {/* Footer */}
     <Footer/>
    </>
  )
}