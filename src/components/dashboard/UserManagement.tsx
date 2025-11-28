'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Users, 
  Loader2,
  XCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { useUserList, useDeleteUser } from '@/hooks/users/use-user-list'

export default function UserManagement() {
  const { addToast } = useToast()
  const { data: users = [], isLoading: loading, error: queryError } = useUserList()
  const deleteUserMutation = useDeleteUser()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null)

  // Show error toast when query fails
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error 
        ? queryError.message 
        : 'Failed to load users. Please check your connection and try again.'
      addToast({
        type: 'error',
        title: 'Error Loading Users',
        description: errorMessage,
        duration: 5000
      })
    }
  }, [queryError, addToast])

  const handleDeleteClick = (id: number, name: string) => {
    setUserToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id)
      addToast({
        type: 'success',
        title: 'Success!',
        description: `User "${userToDelete.name}" deleted successfully!`,
        duration: 3000
      })
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while deleting the user'
      addToast({
        type: 'error',
        title: 'Error Deleting User',
        description: errorMessage,
        duration: 5000
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-2">View and manage all users in the system</p>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 pt-5">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription className="text-gray-400">
            List of all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : queryError ? (
            <div className="text-center py-8 text-red-400">
              <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50 cursor-pointer" />
              <p>Error loading users. Please try again.</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">S.No</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Email</th>
                    {users.some(u => u.created_at) && (
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Created At</th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-700/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {user.email}
                      </td>
                      {users.some(u => u.created_at) && (
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : '—'}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleDeleteClick(user.id, user.name)}
                            disabled={deleteUserMutation.isPending}
                            variant="destructive"
                            size="sm"
                            className="bg-red-800 hover:bg-red-900 text-white cursor-pointer"
                          >
                            {deleteUserMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              Are you sure you want to delete the user{' '}
              <span className="font-semibold text-white">&quot;{userToDelete?.name}&quot;</span>?
              <br />
              <span className="text-red-400 mt-2 block">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader> 
          <DialogFooter className="gap-5 space-x-4 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setUserToDelete(null)
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteUserMutation.isPending}
              className="bg-red-800 hover:bg-red-900 text-white cursor-pointer"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
