'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useMyCourseRequests } from '@/hooks/course/use-my-course-requests'
import { useDeleteCourseRequest } from '@/hooks/course/use-delete-course-request'
import { useToast } from '@/components/ui/toast'
import { Loader2, BookOpen, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    return dateString
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
        <Badge className="bg-green-600/20 text-green-400 border-green-600/40">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-red-600/20 text-red-400 border-red-600/40">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      )
    default:
      return (
        <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/40">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
  }
}

export default function MyCourseRequestsPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<{ id: number; course_name: string } | null>(null)
  const router = useRouter()
  const { addToast } = useToast()

  const { data: paginatedData, isLoading, error } = useMyCourseRequests(currentPage)
  const deleteMutation = useDeleteCourseRequest()
  const courseRequests = useMemo(() => paginatedData?.data || [], [paginatedData?.data])

  const pagination = useMemo(() => {
    if (!paginatedData) return null
    return {
      currentPage: paginatedData.current_page,
      lastPage: paginatedData.last_page,
      total: paginatedData.total,
      from: paginatedData.from,
      to: paginatedData.to,
      hasNextPage: paginatedData.next_page_url !== null,
      hasPrevPage: paginatedData.prev_page_url !== null,
    }
  }, [
    paginatedData?.current_page,
    paginatedData?.last_page,
    paginatedData?.total,
    paginatedData?.from,
    paginatedData?.to,
    paginatedData?.next_page_url,
    paginatedData?.prev_page_url,
  ])

  // Calculate stats - MUST be called before any early returns
  const stats = useMemo(() => {
    const total = pagination?.total || courseRequests.length
    const pending = courseRequests.filter((req) => req.status === 'pending').length
    const approved = courseRequests.filter((req) => req.status === 'approved').length
    const rejected = courseRequests.filter((req) => req.status === 'rejected').length
    return { total, pending, approved, rejected }
  }, [courseRequests, pagination?.total])

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/signin')
      return
    }
    setUser(storedUser)
    setLoading(false)
  }, [router])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenDeleteDialog = (requestId: number, courseName: string) => {
    setRequestToDelete({ id: requestId, course_name: courseName })
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setRequestToDelete(null)
  }

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return

    try {
      await deleteMutation.mutateAsync(requestToDelete.id)
      addToast({
        type: 'success',
        title: 'Request Deleted',
        description: 'Your course request has been deleted successfully.',
        duration: 5000,
      })
      handleCloseDeleteDialog()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete course request. Please try again.'
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: errorMessage,
        duration: 5000,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-orange-500" />
            My Course Requests
          </h1>
          <p className="text-gray-400 mt-2">
            View and track your course requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats.total}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Requests Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Course Requests</CardTitle>
            <CardDescription className="text-gray-400">
              A list of all your course requests
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-gray-400">
                  {error instanceof Error ? error.message : 'Failed to load course requests. Please try again later.'}
                </p>
              </div>
            ) : courseRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <BookOpen className="h-12 w-12 text-gray-500" />
                <p className="text-gray-400">No course requests found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-900/60">
                      <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Requested At
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Course Name
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Subject
                        </th>
                        {/* <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Description
                        </th> */}
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Admin Note
                        </th>
                       
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <Clock className="w-4 h-4" />
                              {formatDate(request.created_at)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-white font-medium">{request.course_name}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {request.subject}
                            </Badge>
                          </td>
                          {/* <td className="py-4 px-4">
                            <div className="text-gray-300 text-sm max-w-md truncate">
                              {request.course_description}
                            </div>
                          </td> */}
                          <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
                          <td className="py-4 px-4">
                            <div className="text-gray-400 text-sm max-w-md">
                              {request.admin_note || '-'}
                            </div>
                          </td>
                          
                          <td className="py-4 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDeleteDialog(request.id, request.course_name)}
                              className="border-red-600 text-red-400 hover:bg-red-600/20 cursor-pointer"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.lastPage > 1 && (
                  <div className="p-4 border-t border-gray-700">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => {
                              if (pagination.hasPrevPage) {
                                handlePageChange(pagination.currentPage - 1)
                              }
                            }}
                            className={
                              !pagination.hasPrevPage
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>

                        {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => {
                          const showPage =
                            page === 1 ||
                            page === pagination.lastPage ||
                            (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)

                          if (!showPage) {
                            if (
                              page === pagination.currentPage - 2 ||
                              page === pagination.currentPage + 2
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )
                            }
                            return null
                          }

                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (!isLoading) {
                                    handlePageChange(page)
                                  }
                                }}
                                isActive={page === currentPage}
                                className={isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => {
                              if (pagination.hasNextPage && !isLoading) {
                                handlePageChange(currentPage + 1)
                              }
                            }}
                            className={
                              !pagination.hasNextPage || isLoading
                                ? 'pointer-events-none opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Delete Course Request</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete this course request? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {requestToDelete && (
              <div className="mt-4">
                <p className="text-gray-300">
                  <span className="font-medium">Course:</span> {requestToDelete.course_name}
                </p>
              </div>
            )}
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDeleteDialog}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRequest}
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

