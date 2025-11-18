'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getStoredUser } from '@/hooks/useAuth'
import { useSlots } from '@/hooks/slots/use-slots'
import { useDeleteSlot } from '@/hooks/slots/use-delete-slot'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Loader2, Plus, Calendar, Clock, Users, DollarSign, BookOpen, XCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (value?: string) => {
  if (!value) return '—'
  try {
    const date = new Date(`1970-01-01T${value}`)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch (error) {
    return value
  }
}

export default function OneToOneSessionPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: slots = [], isLoading: slotsLoading, error: slotsError } = useSlots()
  const deleteSlotMutation = useDeleteSlot()
  const { addToast } = useToast()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [slotToDelete, setSlotToDelete] = useState<{ id: number; label: string } | null>(null)

  const totalSlots = slots.length
  const bookedSlots = slots.filter((slot) => slot.is_booked || slot.booked_count > 0).length
  const upcomingSlots = useMemo(() => {
    const now = new Date()
    return slots.filter((slot) => new Date(slot.available_date) >= now).length
  }, [slots])

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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Live Session</h1>
            <p className="text-gray-400 mt-2">Manage and monitor all your one-to-one teaching slots.</p>
          </div>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer">
            <Link href="/dashboard/one-to-one-session/add-session">
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Slots</p>
                <p className="text-2xl font-bold text-white">{totalSlots}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-white">{upcomingSlots}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Booked</p>
                <p className="text-2xl font-bold text-white">{bookedSlots}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
        </div>

        {/* Slots Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 pt-5">
              <Calendar className="h-5 w-5 text-orange-500" />
              Slots
            </CardTitle>
            <CardDescription className="text-gray-400">
              Overview of all slots fetched from the Brain Bridge API
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {slotsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              </div>
            ) : slotsError ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="text-gray-400">
                  {slotsError instanceof Error ? slotsError.message : 'Failed to load slots. Please try again.'}
                </p>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                No slots available yet. Click &quot;Add Session&quot; to create your first slot.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead className="bg-gray-900/60">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Capacity</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr key={slot.id} className="border-t border-gray-700/60 hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">{slot.subject?.name || '—'}</span>
                            <span className="text-xs text-gray-400">
                              {slot.description || 'No description provided.'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {formatDate(slot.available_date)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-400" />
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          <Badge className="bg-purple-600/80 text-white">
                            {slot.type === 'one_to_one' ? 'One-to-One' : slot.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            ${Number(slot.price).toFixed(2)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {slot.booked_count}/{slot.max_students}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={slot.is_booked ? 'bg-yellow-600/80 text-white' : 'bg-green-600/80 text-white'}>
                            {slot.is_booked ? 'Booked' : 'Open'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-700 text-red-400 hover:bg-red-900/30 cursor-pointer"
                            onClick={() => {
                              setSlotToDelete({ id: slot.id, label: `${slot.subject?.name || 'Slot'} • ${formatDate(slot.available_date)}` })
                              setDeleteDialogOpen(true)
                            }}
                            disabled={deleteSlotMutation.isPending && deletingId === slot.id}
                          >
                            {deleteSlotMutation.isPending && deletingId === slot.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
      <Dialog open={deleteDialogOpen} onOpenChange={(open: boolean) => {
        if (!open) {
          setDeleteDialogOpen(false)
          setSlotToDelete(null)
        } else {
          setDeleteDialogOpen(true)
        }
      }}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Slot</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete
              {slotToDelete?.label ? ` "${slotToDelete.label}"` : ' this slot'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSlotToDelete(null)
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
              disabled={deleteSlotMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!slotToDelete) return
                setDeletingId(slotToDelete.id)
                try {
                  await deleteSlotMutation.mutateAsync(slotToDelete.id)
                  addToast({
                    title: 'Slot deleted',
                    description: `Slot "${slotToDelete.label}" has been removed.`,
                    type: 'success',
                  })
                  setDeleteDialogOpen(false)
                  setSlotToDelete(null)
                } catch (error) {
                  addToast({
                    title: 'Error deleting slot',
                    description: error instanceof Error ? error.message : 'Failed to delete slot.',
                    type: 'error',
                  })
                } finally {
                  setDeletingId(null)
                }
              }}
              className="bg-red-800 hover:bg-red-900 text-white cursor-pointer"
              disabled={deleteSlotMutation.isPending}
            >
              {deleteSlotMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

