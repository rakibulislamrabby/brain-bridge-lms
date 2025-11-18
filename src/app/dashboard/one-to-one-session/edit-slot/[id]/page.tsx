'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getStoredUser } from '@/hooks/useAuth'
import AddSlotForm from '@/components/dashboard/AddSlotForm'
import { useTeacherSlots } from '@/hooks/slots/teacher/use-teacher-slot'
import { TeacherSlot } from '@/hooks/slots/teacher/use-teacher-slot'
import { Loader2 } from 'lucide-react'

export default function EditOneToOneSessionPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [slotData, setSlotData] = useState<TeacherSlot | null>(null)
  const [searching, setSearching] = useState(true)
  const router = useRouter()
  const params = useParams()
  const slotId = params?.id ? Number(params.id) : null

  // Fetch slots from multiple pages to find the slot
  const { data: firstPageData } = useTeacherSlots(1)
  const [currentSearchPage, setCurrentSearchPage] = useState(1)

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/signin')
      return
    }
    setUser(storedUser)
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (!slotId || !firstPageData) return

    // Check first page
    const slot = firstPageData.data.find((s) => s.id === slotId)
    if (slot) {
      setSlotData(slot)
      setSearching(false)
      return
    }

    // If not found on first page, search through other pages
    const searchSlot = async () => {
      let page = 2
      const maxPages = firstPageData.last_page || 10

      while (page <= maxPages) {
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_MAIN_BASE_URL || ''
          const getAuthToken = (): string | null => {
            if (typeof window !== 'undefined') {
              return localStorage.getItem('auth_token')
            }
            return null
          }

          const joinUrl = (path: string) => {
            const trimmedPath = path.startsWith('/') ? path.slice(1) : path
            if (!API_BASE_URL) {
              return `/${trimmedPath}`
            }
            const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
            return `${base}/${trimmedPath}`
          }

          const headers: Record<string, string> = {
            Accept: 'application/json',
          }

          const token = getAuthToken()
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          const url = joinUrl(`teacher/slots?page=${page}`)
          const response = await fetch(url, {
            method: 'GET',
            headers,
          })

          const text = await response.text()
          const result: any = text ? JSON.parse(text) : {}

          if (response.ok && result?.success && result?.slots?.data) {
            const foundSlot = result.slots.data.find((s: TeacherSlot) => s.id === slotId)
            if (foundSlot) {
              setSlotData(foundSlot)
              setSearching(false)
              return
            }
          }

          page++
        } catch (error) {
          console.error('Error searching for slot:', error)
          break
        }
      }

      // If not found, show error
      setSearching(false)
    }

    searchSlot()
  }, [slotId, firstPageData])

  if (loading || searching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-gray-400">
            {searching ? 'Loading slot details...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!slotId) {
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

  if (!slotData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-400">Slot not found</p>
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

