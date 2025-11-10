'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  FolderOpen, 
  Plus, 
  XCircle,
  Loader2,
  Trash2,
  AlertTriangle,
  Edit
} from 'lucide-react'
import { useCreateSubject, useSubjects, useDeleteSubject, useUpdateSubject } from '@/hooks/subject/use-subject'

export default function SubjectManagement() {
  const [formData, setFormData] = useState({
    name: '',
    parent_id: ''
  })
  const [editFormData, setEditFormData] = useState({
    name: ''
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<{ id: number; name: string } | null>(null)
  const [subjectToEdit, setSubjectToEdit] = useState<{ id: number; name: string; parent_id: number | null } | null>(null)
  const { addToast } = useToast()

  // React Query hooks
  const { data: subjects = [], isLoading: loading, error: queryError } = useSubjects()
  const createSubjectMutation = useCreateSubject()
  const deleteSubjectMutation = useDeleteSubject()
  const updateSubjectMutation = useUpdateSubject()

  // Show error toast when query fails
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error 
        ? queryError.message 
        : 'Failed to load subjects. Please check your connection and try again.'
      addToast({
        type: 'error',
        title: 'Error Loading Subjects',
        description: errorMessage,
        duration: 5000
      })
    }
  }, [queryError, addToast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        name: formData.name,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null
      }

      await createSubjectMutation.mutateAsync(payload)
      
      addToast({
        type: 'success',
        title: 'Success!',
        description: 'Subject created successfully!',
        duration: 3000
      })
      
      setFormData({ name: '', parent_id: '' })
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while creating the subject'
      addToast({
        type: 'error',
        title: 'Error Creating Subject',
        description: errorMessage,
        duration: 5000
      })
    }
  }

  const handleEditClick = (subject: { id: number; name: string; parent_id: number | null }) => {
    setSubjectToEdit(subject)
    setEditFormData({
      name: subject.name
    })
    setEditDialogOpen(true)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectToEdit) return

    try {
      const payload = {
        name: editFormData.name.trim(),
        parent_id: subjectToEdit.parent_id // Keep existing parent_id
      }

      await updateSubjectMutation.mutateAsync({
        id: subjectToEdit.id,
        data: payload
      })
      
      addToast({
        type: 'success',
        title: 'Success!',
        description: `Subject "${editFormData.name}" updated successfully!`,
        duration: 3000
      })
      
      setEditDialogOpen(false)
      setSubjectToEdit(null)
      setEditFormData({ name: '' })
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while updating the subject'
      addToast({
        type: 'error',
        title: 'Error Updating Subject',
        description: errorMessage,
        duration: 5000
      })
    }
  }

  const handleDeleteClick = (id: number, name: string) => {
    setSubjectToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return

    try {
      await deleteSubjectMutation.mutateAsync(subjectToDelete.id)
      addToast({
        type: 'success',
        title: 'Success!',
        description: `Subject "${subjectToDelete.name}" deleted successfully!`,
        duration: 3000
      })
      setDeleteDialogOpen(false)
      setSubjectToDelete(null)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while deleting the subject'
      addToast({
        type: 'error',
        title: 'Error Deleting Subject',
        description: errorMessage,
        duration: 5000
      })
    }
  }

  // Get parent subjects for dropdown (only subjects without parents)
  const parentSubjects = subjects.filter(subject => !subject.parent_id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Subject Management</h1>
        <p className="text-gray-400 mt-2">Add and manage subjects for your courses</p>
      </div>

      {/* Add Subject Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2  pt-5">
            <Plus className="h-5 w-5" />
            Add New Subject
          </CardTitle>
          <CardDescription className="text-gray-400">
            Create a new subject with optional parent category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                  Subject Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                />
              </div>
              <Button
                type="submit"
                disabled={createSubjectMutation.isPending || !formData.name.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white h-10 cursor-pointer"
                size="sm"
              >
                {createSubjectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 pt-5">
            <FolderOpen className="h-5 w-5" />
            All Subjects
          </CardTitle>
          <CardDescription className="text-gray-400">
            List of all subjects in the system
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
              <p>Error loading subjects. Please try again.</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No subjects found. Create your first subject above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Subject Name</th>
                   
                    {subjects.some(s => s.created_at) && (
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Created At</th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => {
                    const parentSubject = subjects.find(s => s.id === subject.parent_id)
                    return (
                      <tr
                        key={subject.id}
                        className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                          index % 2 === 0 ? 'bg-gray-700/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {subject.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-white">{subject.name}</span>
                          </div>
                        </td>
                        
                        {subjects.some(s => s.created_at) && (
                          <td className="py-3 px-4 text-sm text-gray-400">
                            {subject.created_at
                              ? new Date(subject.created_at).toLocaleDateString('en-US', {
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
                              onClick={() => handleEditClick(subject)}
                              disabled={updateSubjectMutation.isPending || deleteSubjectMutation.isPending}
                              variant="outline"
                              size="sm"
                              className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(subject.id, subject.name)}
                              disabled={deleteSubjectMutation.isPending || updateSubjectMutation.isPending}
                              variant="destructive"
                              size="sm"
                              className="bg-red-800 hover:bg-red-900 text-white cursor-pointer"
                            >
                              {deleteSubjectMutation.isPending ? (
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Subject Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="h-5 w-5 text-orange-500" />
              Edit Subject
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              Update the subject information below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-300">
                  Subject Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  placeholder="e.g., Mathematics"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                />
              </div>
            </div>
            <DialogFooter className="gap-5 space-x-4 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setSubjectToEdit(null)
                  setEditFormData({ name: '' })
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                disabled={updateSubjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSubjectMutation.isPending || !editFormData.name.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
              >
                {updateSubjectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Subject
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              Are you sure you want to delete the subject{' '}
              <span className="font-semibold text-white">&quot;{subjectToDelete?.name}&quot;</span>?
              <br />
              <span className="text-red-400 mt-2 block">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader> 
          <DialogFooter className="gap-5 space-x-4 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSubjectToDelete(null)
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
              disabled={deleteSubjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteSubjectMutation.isPending}
              className="bg-red-800 hover:bg-red-900 text-white cursor-pointer"
            >
              {deleteSubjectMutation.isPending ? (
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

