import { AppHeader } from "@/components/app-header"
import AllCourse from "@/components/Courses/AllCourse"
import Footer from "@/components/shared/Footer"

export default function CoursesPage() {
  return (
    <>
      <div className="px-4 mx-auto">
        <AppHeader />
        <AllCourse />
      </div>
      <Footer />
    </>
  )
}
