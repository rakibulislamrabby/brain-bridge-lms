'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getStoredUser } from '@/hooks/useAuth'
  import EditInPersonSlotForm from '@/components/dashboard/EditInPersonSlotForm'
import { Loader2 } from 'lucide-react'

export default function EditInPersonSessionPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const slotId = params?.id ? Number(params.id) : null

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/signin')
      return
    }
    setUser(storedUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!slotId || !Number.isFinite(slotId) || slotId <= 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-400">Invalid slot ID</p>
          <button
            onClick={() => router.push('/dashboard/in-person-session')}
            className="mt-4 text-orange-400 hover:text-orange-500"
          >
            Back to Slots
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <EditInPersonSlotForm slotId={slotId} />
    </DashboardLayout>
  )
}

