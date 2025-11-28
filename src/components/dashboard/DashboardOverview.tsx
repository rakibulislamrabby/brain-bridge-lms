'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Star,
  Award,
  Activity,
  BarChart3
} from 'lucide-react'

export default function DashboardOverview() {
  // Mock data
  const stats = {
    totalTeachers: 1240,
    totalStudents: 14180,
    totalCourses: 456,
    totalSessions: 45680,
    monthlyRevenue: 125000,
    averageRating: 4.7,
    activeUsers: 2340,
    completionRate: 87
  }

  const recentActivity = [
    { id: 1, type: 'teacher', message: 'New teacher Sarah Johnson joined', time: '2 hours ago' },
    { id: 2, type: 'course', message: 'Course "Advanced JavaScript" published', time: '4 hours ago' },
    { id: 3, type: 'session', message: '150 sessions completed today', time: '6 hours ago' },
    { id: 4, type: 'student', message: 'New student Mike Chen enrolled', time: '8 hours ago' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Welcome to Brain Bridge LMS Administration</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Teachers</p>
                <p className="text-2xl font-bold text-white">{stats.totalTeachers.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-white">{stats.totalStudents.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{stats.totalSessions.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-white">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white pt-5">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg bg-gray-700/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'teacher' ? 'bg-blue-500/20 text-blue-400' :
                    activity.type === 'course' ? 'bg-green-500/20 text-green-400' :
                    activity.type === 'session' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {activity.type === 'teacher' ? <Users className="h-4 w-4" /> :
                     activity.type === 'course' ? <BookOpen className="h-4 w-4" /> :
                     activity.type === 'session' ? <Calendar className="h-4 w-4" /> :
                     <Users className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{activity.message}</p>
                    <p className="text-sm text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white pt-5">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700/50">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-white">Manage Teachers</p>
                  <p className="text-sm text-gray-400">View and manage teacher accounts</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700/50">
                <BookOpen className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-white">Manage Courses</p>
                  <p className="text-sm text-gray-400">View and manage course content</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors bg-gray-700/50">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium text-white">View Analytics</p>
                  <p className="text-sm text-gray-400">Platform performance metrics</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
