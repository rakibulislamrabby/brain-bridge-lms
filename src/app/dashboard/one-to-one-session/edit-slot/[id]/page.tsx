'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getStoredUser } from '@/hooks/useAuth'
import AddSlotForm from '@/components/dashboard/AddSlotForm'
import { useTeacherSlotDetail } from '@/hooks/slots/use-teacher-slot-detail'
import { Loader2 } from 'lucide-react'

export default function EditOneToOneSessionPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const slotId = params?.id ? Number(params.id) : null

  // Fetch slot data via API: teacher/slots/{id}
  const {
    data: slotData,
    isLoading: isLoadingSlot,
    error: slotError,
  } = useTeacherSlotDetail(slotId)

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
            onClick={() => router.push('/dashboard/one-to-one-session')}
            className="mt-4 text-orange-400 hover:text-orange-500"
          >
            Back to Slots
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoadingSlot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-gray-400">Loading slot details...</p>
        </div>
      </div>
    )
  }

  if (slotError || !slotData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-400">
            {slotError instanceof Error ? slotError.message : 'Slot not found'}
          </p>
          <button
            onClick={() => router.push('/dashboard/one-to-one-session')}
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
      <AddSlotForm slotId={slotId} initialData={slotData} />
    </DashboardLayout>
  )
}
