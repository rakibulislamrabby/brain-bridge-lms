'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  BookOpen, 
  DollarSign,
  Calendar,
  Award,
  Loader2,
  TrendingUp
} from 'lucide-react'
import { useDashboardInfo } from '@/hooks/dashboard/use-dashboard-info'
import { AdminDashboardInfo } from '@/hooks/dashboard/use-dashboard-info'

export default function AdminDashboardOverview() {
  const { data: dashboardData, isLoading, error } = useDashboardInfo()

  // Type guard to check if data is AdminDashboardInfo
  const isAdminData = (data: any): data is AdminDashboardInfo => {
    return data && 'totalTeacher' in data && 'totalStudent' in data
  }

  const adminData = isAdminData(dashboardData) ? dashboardData : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Loading dashboard information...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Error loading dashboard information</p>
        </div>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-red-400">
              {error instanceof Error ? error.message : 'Failed to load dashboard data'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!adminData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">No dashboard data available</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome to Brain Bridge LMS Administration</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Teachers</p>
                <p className="text-2xl font-bold text-white">{adminData.totalTeacher.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-white">{adminData.totalStudent.toLocaleString()}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-white">{adminData.totalCourse.toLocaleString()}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{adminData.totalSessions.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Enrolled Courses</p>
                <p className="text-2xl font-bold text-white">{adminData.enrolledCourses.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(adminData.enrolledCoursesEarning)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Transactions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 pt-5">
            <DollarSign className="h-5 w-5 text-green-500" />
            Latest Transactions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Recent course enrollment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminData.latestTranscation && adminData.latestTranscation.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Course ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Student ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Teacher ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Enrolled At</th>
                  </tr>
                </thead>
                <tbody>
                  {adminData.latestTranscation.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-white">{transaction.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{transaction.course_id}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{transaction.student_id}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{transaction.teacher_id}</td>
                      <td className="py-3 px-4 text-sm text-green-400 font-medium">
                        {formatCurrency(transaction.amount_paid)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.payment_status === 'paid'
                              ? 'bg-green-500/20 text-green-400'
                              : transaction.payment_status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {transaction.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {formatDate(transaction.enrolled_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
