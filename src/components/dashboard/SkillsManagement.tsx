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
  Target, 
  Plus, 
  XCircle,
  Loader2,
  Trash2,
  AlertTriangle,
  Edit
} from 'lucide-react'
import { useCreateSkill, useSkills, useDeleteSkill, useUpdateSkill } from '@/hooks/skills/use-skills'
import { useSubjects } from '@/hooks/subject/use-subject'

export default function SkillsManagement() {
  const [formData, setFormData] = useState({
    name: '',
    subject_id: ''
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    subject_id: ''
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [skillToDelete, setSkillToDelete] = useState<{ id: number; name: string } | null>(null)
  const [skillToEdit, setSkillToEdit] = useState<{ id: number; name: string; subject_id: number } | null>(null)
  const { addToast } = useToast()

  // React Query hooks
  const { data: skills = [], isLoading: loading, error: queryError } = useSkills()
  const { data: subjects = [] } = useSubjects()
  const createSkillMutation = useCreateSkill()
  const deleteSkillMutation = useDeleteSkill()
  const updateSkillMutation = useUpdateSkill()

  // Show error toast when query fails
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error 
        ? queryError.message 
        : 'Failed to load skills. Please check your connection and try again.'
      addToast({
        type: 'error',
        title: 'Error Loading Skills',
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
        subject_id: parseInt(formData.subject_id)
      }

      await createSkillMutation.mutateAsync(payload)
      
      addToast({
        type: 'success',
        title: 'Success!',
        description: 'Skill created successfully!',
        duration: 3000
      })
      
      setFormData({ name: '', subject_id: '' })
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while creating the skill'
      addToast({
        type: 'error',
        title: 'Error Creating Skill',
        description: errorMessage,
        duration: 5000
      })
    }
  }

  const handleEditClick = (skill: { id: number; name: string; subject_id: number }) => {
    setSkillToEdit(skill)
    setEditFormData({
      name: skill.name,
      subject_id: skill.subject_id.toString()
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
    if (!skillToEdit) return

    try {
      const payload = {
        name: editFormData.name.trim(),
        subject_id: parseInt(editFormData.subject_id)
      }

      await updateSkillMutation.mutateAsync({
        id: skillToEdit.id,
        data: payload
      })
      
      addToast({
        type: 'success',
        title: 'Success!',
        description: `Skill "${editFormData.name}" updated successfully!`,
        duration: 3000
      })
      
      setEditDialogOpen(false)
      setSkillToEdit(null)
      setEditFormData({ name: '', subject_id: '' })
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while updating the skill'
      addToast({
        type: 'error',
        title: 'Error Updating Skill',
        description: errorMessage,
        duration: 5000
      })
    }
  }

  const handleDeleteClick = (id: number, name: string) => {
    setSkillToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!skillToDelete) return

    try {
      await deleteSkillMutation.mutateAsync(skillToDelete.id)
      addToast({
        type: 'success',
        title: 'Success!',
        description: `Skill "${skillToDelete.name}" deleted successfully!`,
        duration: 3000
      })
      setDeleteDialogOpen(false)
      setSkillToDelete(null)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while deleting the skill'
      addToast({
        type: 'error',
        title: 'Error Deleting Skill',
        description: errorMessage,
        duration: 5000
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Skills Management</h1>
        <p className="text-gray-400 mt-2">Add and manage skills for your subjects</p>
      </div>

      {/* Add Skill Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 pt-5">
            <Plus className="h-5 w-5" />
            Add New Skill
          </CardTitle>
          <CardDescription className="text-gray-400">
            Create a new skill and associate it with a subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                  Skill Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Problem Solving"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject_id" className="text-sm font-medium text-gray-300">
                  Subject <span className="text-red-400">*</span>
                </Label>
                <select
                  id="subject_id"
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-10"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={createSkillMutation.isPending || !formData.name.trim() || !formData.subject_id}
                  className="bg-orange-600 hover:bg-orange-700 text-white h-10 w-full cursor-pointer"
                  size="sm"
                >
                  {createSkillMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Skills Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 pt-5">
            <Target className="h-5 w-5" />
            All Skills
          </CardTitle>
          <CardDescription className="text-gray-400">
            List of all skills in the system
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
              <p>Error loading skills. Please try again.</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No skills found. Create your first skill above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Skill Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Subject</th>
                    {skills.some(s => s.created_at) && (
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Created At</th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((skill, index) => (
                    <tr
                      key={skill.id}
                      className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-700/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {skill.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-white">{skill.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {skill.subject ? (
                          <span className="text-orange-400">{skill.subject.name}</span>
                        ) : (
                          <span className="text-gray-500">ID: {skill.subject_id}</span>
                        )}
                      </td>
                      {skills.some(s => s.created_at) && (
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {skill.created_at
                            ? new Date(skill.created_at).toLocaleDateString('en-US', {
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
                            onClick={() => handleEditClick(skill)}
                            disabled={updateSkillMutation.isPending || deleteSkillMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(skill.id, skill.name)}
                            disabled={deleteSkillMutation.isPending || updateSkillMutation.isPending}
                            variant="destructive"
                            size="sm"
                            className="bg-red-800 hover:bg-red-900 text-white cursor-pointer"
                          >
                            {deleteSkillMutation.isPending ? (
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

      {/* Edit Skill Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="h-5 w-5 text-orange-500" />
              Edit Skill
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              Update the skill information below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-300">
                  Skill Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  placeholder="e.g., Problem Solving"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject_id" className="text-sm font-medium text-gray-300">
                  Subject <span className="text-red-400">*</span>
                </Label>
                <select
                  id="edit-subject_id"
                  name="subject_id"
                  value={editFormData.subject_id}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="gap-5 space-x-4 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setSkillToEdit(null)
                  setEditFormData({ name: '', subject_id: '' })
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                disabled={updateSkillMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSkillMutation.isPending || !editFormData.name.trim() || !editFormData.subject_id}
                className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
              >
                {updateSkillMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Skill
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
              Are you sure you want to delete the skill{' '}
              <span className="font-semibold text-white">&quot;{skillToDelete?.name}&quot;</span>?
              <br />
              <span className="text-red-400 mt-2 block">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader> 
          <DialogFooter className="gap-5 space-x-4 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSkillToDelete(null)
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
              disabled={deleteSkillMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteSkillMutation.isPending}
              className="bg-red-800 hover:bg-red-900 text-white cursor-pointer"
            >
              {deleteSkillMutation.isPending ? (
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

