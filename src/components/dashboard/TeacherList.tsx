'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  GraduationCap, 
  Loader2,
  XCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  CreditCard,
  FileText,
  Star,
  Users,
} from 'lucide-react'
import { useTeachers } from '@/hooks/teacher/use-teachers'
import Image from 'next/image'

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_MAIN_STORAGE_URL || ''

const resolveProfilePictureUrl = (path?: string | null): string | null => {
  if (!path || typeof path !== 'string') {
    return null
  }
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const base = STORAGE_BASE_URL.endsWith('/') ? STORAGE_BASE_URL.slice(0, -1) : STORAGE_BASE_URL
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${cleanedPath}`
}

export default function TeacherList() {
  const { data: teachers = [], isLoading: loading, error: queryError } = useTeachers()
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null)

  const handleViewDetails = (teacher: any) => {
    setSelectedTeacher(teacher)
    setDetailsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Teacher List</h1>
        <p className="text-gray-400 mt-2">View and manage all teachers in the system</p>
      </div>

      {/* Teachers Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 pt-5">
            <GraduationCap className="h-5 w-5" />
            All Teachers
          </CardTitle>
          <CardDescription className="text-gray-400">
            List of all teachers in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : queryError ? (
            <div className="text-center py-8 text-red-400">
              <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Error loading teachers. Please try again.</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No teachers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">S.No</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Level</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher, index) => (
                    <tr
                      key={teacher.id}
                      className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-700/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {teacher.profile_picture ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <Image
                                src={resolveProfilePictureUrl(teacher.profile_picture) || ''}
                                alt={teacher.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {teacher.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-white">{teacher.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {teacher.email}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {teacher.teacher?.title || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {teacher.teacher?.average_rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-white">{teacher.teacher.average_rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {teacher.teacher?.teacher_level?.level_name || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => handleViewDetails(teacher)}
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-400 hover:bg-blue-900/30 cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          See Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTeacher && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">Teacher Details</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Complete information about {selectedTeacher.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Profile Section */}
                <div className="flex items-start gap-6 pb-6 border-b border-gray-700">
                  <div className="flex-shrink-0">
                    {selectedTeacher.profile_picture ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-orange-500">
                        <Image
                          src={resolveProfilePictureUrl(selectedTeacher.profile_picture) || ''}
                          alt={selectedTeacher.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center border-2 border-orange-500">
                        <span className="text-3xl font-bold text-white">
                          {selectedTeacher.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedTeacher.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="h-4 w-4 text-orange-500" />
                        <span>{selectedTeacher.email}</span>
                      </div>
                      {selectedTeacher.phone && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone className="h-4 w-4 text-orange-500" />
                          <span>{selectedTeacher.phone}</span>
                        </div>
                      )}
                      {selectedTeacher.address && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span>{selectedTeacher.address}</span>
                        </div>
                      )}
                      {selectedTeacher.bio && (
                        <p className="text-gray-400 mt-2">{selectedTeacher.bio}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bank Account Information - Show FIRST if exists */}
                {selectedTeacher.teacher && (
                  (selectedTeacher.teacher.payment_method || 
                   selectedTeacher.teacher.bank_name || 
                   selectedTeacher.teacher.bank_account_number || 
                   selectedTeacher.teacher.bank_routing_number ||
                   selectedTeacher.teacher.paypal_email || 
                   selectedTeacher.teacher.stripe_account_id || 
                   selectedTeacher.teacher.tax_id) && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-orange-500" />
                        Payment Information
                      </h4>
                      <div className="bg-gray-700/30 p-4 rounded-lg space-y-4">
                        {selectedTeacher.teacher.payment_method && (
                          <div>
                            <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                              <CreditCard className="h-4 w-4" />
                              Payment Method
                            </label>
                            <p className="text-white font-medium capitalize">{selectedTeacher.teacher.payment_method}</p>
                          </div>
                        )}

                        {/* Bank Information */}
                        {(selectedTeacher.teacher.bank_name || selectedTeacher.teacher.bank_account_number || selectedTeacher.teacher.bank_routing_number) && (
                          <div className="space-y-3 pt-3 border-t border-gray-600">
                            <h5 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-orange-500" />
                              Bank Account Details
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                              {selectedTeacher.teacher.bank_name && (
                                <div>
                                  <label className="text-xs text-gray-500">Bank Name</label>
                                  <p className="text-white">{selectedTeacher.teacher.bank_name}</p>
                                </div>
                              )}
                              {selectedTeacher.teacher.bank_account_number && (
                                <div>
                                  <label className="text-xs text-gray-500">Account Number</label>
                                  <p className="text-white font-mono">{selectedTeacher.teacher.bank_account_number}</p>
                                </div>
                              )}
                              {selectedTeacher.teacher.bank_routing_number && (
                                <div>
                                  <label className="text-xs text-gray-500">Routing Number</label>
                                  <p className="text-white font-mono">{selectedTeacher.teacher.bank_routing_number}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* PayPal Information */}
                        {selectedTeacher.teacher.paypal_email && (
                          <div className="pt-3 border-t border-gray-600">
                            <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                              <Mail className="h-4 w-4 text-orange-500" />
                              PayPal Email
                            </label>
                            <p className="text-white">{selectedTeacher.teacher.paypal_email}</p>
                          </div>
                        )}

                        {/* Stripe Information */}
                        {selectedTeacher.teacher.stripe_account_id && (
                          <div className="pt-3 border-t border-gray-600">
                            <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                              <CreditCard className="h-4 w-4 text-orange-500" />
                              Stripe Account ID
                            </label>
                            <p className="text-white font-mono text-sm">{selectedTeacher.teacher.stripe_account_id}</p>
                          </div>
                        )}

                        {/* Tax ID */}
                        {selectedTeacher.teacher.tax_id && (
                          <div className="pt-3 border-t border-gray-600">
                            <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-orange-500" />
                              Tax ID
                            </label>
                            <p className="text-white font-mono">{selectedTeacher.teacher.tax_id}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* Teacher Summary Information */}
                {selectedTeacher.teacher && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-orange-500" />
                      Teacher Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700/30 p-4 rounded-lg">
                      {selectedTeacher.teacher.title && (
                        <div>
                          <label className="text-sm text-gray-400">Title</label>
                          <p className="text-white font-medium">{selectedTeacher.teacher.title}</p>
                        </div>
                      )}
                      {selectedTeacher.teacher.base_pay && (
                        <div>
                          <label className="text-sm text-gray-400">Base Pay</label>
                          <p className="text-white font-medium">${selectedTeacher.teacher.base_pay}</p>
                        </div>
                      )}
                      {selectedTeacher.teacher.average_rating !== undefined && selectedTeacher.teacher.average_rating > 0 && (
                        <div>
                          <label className="text-sm text-gray-400">Average Rating</label>
                          <p className="text-white font-medium flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            {selectedTeacher.teacher.average_rating.toFixed(1)}
                          </p>
                        </div>
                      )}
                      {selectedTeacher.teacher.total_sessions !== undefined && (
                        <div>
                          <label className="text-sm text-gray-400">Total Sessions</label>
                          <p className="text-white font-medium">{selectedTeacher.teacher.total_sessions}</p>
                        </div>
                      )}
                      {selectedTeacher.teacher.teacher_level && (
                        <div>
                          <label className="text-sm text-gray-400">Teacher Level</label>
                          <p className="text-white font-medium">{selectedTeacher.teacher.teacher_level.level_name || 'N/A'}</p>
                        </div>
                      )}
                      {selectedTeacher.teacher.five_star_reviews !== undefined && (
                        <div>
                          <label className="text-sm text-gray-400">Five Star Reviews</label>
                          <p className="text-white font-medium">{selectedTeacher.teacher.five_star_reviews}</p>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {selectedTeacher.teacher.skills && selectedTeacher.teacher.skills.length > 0 && (
                      <div className="mt-4">
                        <label className="text-sm text-gray-400 mb-2 block">Skills</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeacher.teacher.skills.map((skill: any, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm border border-orange-500/30"
                            >
                              {skill.name || skill.skill?.name || 'Unknown Skill'}
                              {skill.pivot?.years_of_experience && ` (${skill.pivot.years_of_experience} yrs)`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button
                  onClick={() => setDetailsDialogOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white cursor-pointer"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

