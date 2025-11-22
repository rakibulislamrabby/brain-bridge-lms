'use client'

import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import LiveSessions from '@/components/Home/LiveSessions'

export default function LiveSessionPage() {
  return (
    <div>
      <AppHeader/>
      <LiveSessions 
        showPagination={true}
        showHeader={true}
        showShowMore={false}
      />
      <Footer/>
    </div>
  )
}
