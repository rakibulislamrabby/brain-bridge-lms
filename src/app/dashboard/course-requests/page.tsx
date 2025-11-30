'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUser } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCourseRequests } from '@/hooks/course/use-course-requests'
import {
  useApproveCourseRequest,
  useRejectCourseRequest,
} from '@/hooks/course/use-course-request-action'
import {
  Loader2,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Info,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
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

export default function CourseRequestsPage() {
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null)
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<any>(null)
  const [adminNote, setAdminNote] = useState('')
  const router = useRouter()
  const { addToast } = useToast()

  const { data: paginatedData, isLoading, error } = useCourseRequests(currentPage)
  const approveMutation = useApproveCourseRequest()
  const rejectMutation = useRejectCourseRequest()

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

  const isProcessing = approveMutation.isPending || rejectMutation.isPending

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

  const handleOpenActionDialog = (requestId: number, action: 'approve' | 'reject') => {
    setSelectedRequest({ id: requestId, action })
    setAdminNote('')
    setActionDialogOpen(true)
  }

  const handleCloseActionDialog = () => {
    setActionDialogOpen(false)
    setSelectedRequest(null)
    setAdminNote('')
  }

  const handleOpenDetailsDialog = (request: any) => {
    setSelectedRequestForDetails(request)
    setDetailsDialogOpen(true)
  }

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false)
    setSelectedRequestForDetails(null)
  }

  const handleSubmitAction = async () => {
    if (!selectedRequest) return

    try {
      const data = adminNote.trim() ? { admin_note: adminNote.trim() } : undefined

      if (selectedRequest.action === 'approve') {
        await approveMutation.mutateAsync({
          requestId: selectedRequest.id,
          data,
        })
        addToast({
          type: 'success',
          title: 'Request Approved',
          description: 'The course request has been approved successfully.',
          duration: 5000,
        })
      } else {
        await rejectMutation.mutateAsync({
          requestId: selectedRequest.id,
          data,
        })
        addToast({
          type: 'success',
          title: 'Request Rejected',
          description: 'The course request has been rejected.',
          duration: 5000,
        })
      }

      handleCloseActionDialog()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request. Please try again.'
      addToast({
        type: 'error',
        title: selectedRequest.action === 'approve' ? 'Approval Failed' : 'Rejection Failed',
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
            Course Requests
          </h1>
          <p className="text-gray-400 mt-2">
            Review and manage course requests from students
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
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
            <CardTitle className="text-white pt-5">Course Requests</CardTitle>
            <CardDescription className="text-gray-400 ">
              A list of all course requests from students
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
                          Student
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Course Name
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Subject
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Status
                        </th>
                       
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Details
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
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-white font-medium">{request.student.name}</span>
                              </div>
                              {/* <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Mail className="w-3 h-3" />
                                <span>{request.student.email}</span>
                              </div> */}
                              {/* {request.student.phone && (
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                  <Phone className="w-3 h-3" />
                                  <span>{request.student.phone}</span>
                                </div>
                              )} */}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-white font-medium">{request.course_name}</div>
                            {request.additional_note && (
                              <div className="text-gray-400 text-sm mt-1">
                                Note: {request.additional_note}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {request.subject}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
                          
                          <td className="py-4 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDetailsDialog(request)}
                              className="border-blue-600 text-blue-400 hover:bg-blue-600/20 cursor-pointer"
                            >
                              <Info className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </td>
                          <td className="py-4 px-4">
                            {request.status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenActionDialog(request.id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                                  disabled={isProcessing}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenActionDialog(request.id, 'reject')}
                                  className="border-red-600 text-red-400 hover:bg-red-600/20 cursor-pointer"
                                  disabled={isProcessing}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">
                                {request.admin_note && (
                                  <div className="max-w-xs">
                                    <span className="font-medium">Note: </span>
                                    {request.admin_note}
                                  </div>
                                )}
                              </div>
                            )}
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

        {/* Action Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={handleCloseActionDialog}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedRequest?.action === 'approve' ? 'Approve' : 'Reject'} Course Request
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedRequest?.action === 'approve'
                  ? 'Approve this course request. You can add an optional note.'
                  : 'Reject this course request. You can add an optional note explaining the reason.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="admin_note" className="text-white">
                  Admin Note (Optional)
                </Label>
                <Textarea
                  id="admin_note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    selectedRequest?.action === 'approve'
                      ? 'Add a note for the student (optional)...'
                      : 'Add a note explaining why this request was rejected (optional)...'
                  }
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseActionDialog}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAction}
                  className={
                    selectedRequest?.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  }
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {selectedRequest?.action === 'approve' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={handleCloseDetailsDialog}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Course Request Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete information about this course request
              </DialogDescription>
            </DialogHeader>
            {selectedRequestForDetails && (
              <div className="space-y-6 mt-4">
                {/* Student Information */}
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Student Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-gray-300">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Name:</span>
                      <span>{selectedRequestForDetails.student.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Email:</span>
                      <span>{selectedRequestForDetails.student.email}</span>
                    </div>
                    {selectedRequestForDetails.student.phone && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Phone:</span>
                        <span>{selectedRequestForDetails.student.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Request Information */}
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-400" />
                    Course Request Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-400">Course Name:</span>
                      <p className="text-white mt-1">{selectedRequestForDetails.course_name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Subject:</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {selectedRequestForDetails.subject}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Description:</span>
                      <p className="text-gray-300 mt-1 whitespace-pre-wrap">{selectedRequestForDetails.course_description}</p>
                    </div>
                    {selectedRequestForDetails.additional_note && (
                      <div>
                        <span className="text-sm font-medium text-gray-400">Additional Note:</span>
                        <p className="text-gray-300 mt-1 whitespace-pre-wrap">{selectedRequestForDetails.additional_note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status and Admin Information */}
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Status & Admin Notes
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-400">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedRequestForDetails.status)}</div>
                    </div>
                    {selectedRequestForDetails.admin_note && (
                      <div>
                        <span className="text-sm font-medium text-gray-400">Admin Note:</span>
                        <p className="text-gray-300 mt-1 whitespace-pre-wrap">{selectedRequestForDetails.admin_note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Timestamps
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Created At:</span>
                      <span>{formatDate(selectedRequestForDetails.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Updated At:</span>
                      <span>{formatDate(selectedRequestForDetails.updated_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedRequestForDetails.status === 'pending' && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleCloseDetailsDialog()
                        handleOpenActionDialog(selectedRequestForDetails.id, 'reject')
                      }}
                      className="border-red-600 text-red-400 hover:bg-red-600/20 cursor-pointer"
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleCloseDetailsDialog()
                        handleOpenActionDialog(selectedRequestForDetails.id, 'approve')
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                      disabled={isProcessing}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

