'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { getStoredUser } from '@/hooks/useAuth'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Profile Temporarily Unavailable
            </CardTitle>
            <CardDescription className="text-gray-400">
              We&apos;re working on restoring profile details soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              The profile service is currently offline, so we can&apos;t display your personal information right now.
              You can continue using other parts of the dashboard, and we&apos;ll notify you once this page is back.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.refresh()}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
