import { AppHeader } from "@/components/app-header"
import Footer from "@/components/shared/Footer"
import PointSystem from "@/components/Point/PointSystem"

export default function PointsPage() {
  return (
    <>
      <div className="bg-gray-900 min-h-screen">
        <AppHeader />
        <PointSystem />
      </div>
      <Footer />
    </>
  )
}

