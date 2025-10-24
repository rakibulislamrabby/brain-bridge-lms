'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Calendar, 
  Video, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Award,
  MessageCircle,
  Upload,
  BarChart3,
  Settings,
  Trophy,
  Target,
  BookOpen
} from 'lucide-react'

interface TeacherDashboardProps {
  user: { id: number; name: string; email: string } | null
}

export default function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock teacher data
  const teacherStats = {
    currentLevel: 'Gold',
    nextLevel: 'Platinum',
    levelProgress: 75,
    totalStudents: 156,
    totalSessions: 89,
    averageRating: 4.8,
    monthlyEarnings: 2450,
    upcomingSessions: 5
  }

  const levelBenefits = {
    Bronze: { pay: '$25/hour', visibility: 'Basic', features: ['Basic profile', 'Standard support'] },
    Silver: { pay: '$35/hour', visibility: 'Enhanced', features: ['Enhanced profile', 'Priority support', 'Analytics'] },
    Gold: { pay: '$50/hour', visibility: 'Featured', features: ['Featured profile', 'Premium support', 'Advanced analytics', 'Video uploads'] },
    Platinum: { pay: '$75/hour', visibility: 'Promoted', features: ['Promoted profile', 'VIP support', 'Full analytics', 'Custom rates'] },
    Master: { pay: 'Custom', visibility: 'Elite', features: ['Elite profile', 'Dedicated support', 'Full control', 'Platform promotion'] }
  }

  const recentSessions = [
    { id: 1, student: 'John Doe', subject: 'JavaScript Fundamentals', date: '2024-01-15', duration: '60 min', rating: 5, earnings: 50 },
    { id: 2, student: 'Jane Smith', subject: 'React Development', date: '2024-01-14', duration: '90 min', rating: 5, earnings: 75 },
    { id: 3, student: 'Mike Johnson', subject: 'Node.js Backend', date: '2024-01-13', duration: '60 min', rating: 4, earnings: 50 }
  ]

  const upcomingSessions = [
    { id: 1, student: 'Sarah Wilson', subject: 'TypeScript Advanced', date: '2024-01-20', time: '10:00 AM', duration: '60 min' },
    { id: 2, student: 'David Brown', subject: 'Database Design', date: '2024-01-22', time: '2:00 PM', duration: '90 min' },
    { id: 3, student: 'Lisa Garcia', subject: 'API Development', date: '2024-01-25', time: '11:00 AM', duration: '60 min' }
  ]

  const performanceMetrics = {
    attendanceRate: 98,
    studentSatisfaction: 96,
    sessionCompletion: 94,
    responseTime: '2 hours'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'content', label: 'Content', icon: Upload }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">Manage your teaching activities and grow your impact</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Trophy className="h-4 w-4 mr-1" />
              {teacherStats.currentLevel} Level
            </Badge>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{teacherStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{teacherStats.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${teacherStats.monthlyEarnings}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{teacherStats.upcomingSessions}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Teacher Level Progress
          </CardTitle>
          <CardDescription>Advance to unlock higher pay and more features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Progress to {teacherStats.nextLevel} Level</h3>
                <p className="text-sm text-gray-500">Current: {teacherStats.currentLevel} • Next: {teacherStats.nextLevel}</p>
              </div>
              <Badge variant="outline">{teacherStats.levelProgress}%</Badge>
            </div>
            <Progress value={teacherStats.levelProgress} className="h-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Benefits</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {levelBenefits[teacherStats.currentLevel as keyof typeof levelBenefits]?.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Next Level Benefits</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {levelBenefits[teacherStats.nextLevel as keyof typeof levelBenefits]?.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Sessions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Sessions
                </CardTitle>
                <CardDescription>Your latest teaching sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{session.subject}</h3>
                          <p className="text-sm text-gray-500">with {session.student}</p>
                          <p className="text-sm text-gray-600">{session.date} • {session.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-green-600">${session.earnings}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < session.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Sessions
                </CardTitle>
                <CardDescription>Your scheduled lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">{session.subject}</h3>
                      <p className="text-sm text-gray-500 mb-2">with {session.student}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {session.date} at {session.time}
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline">{session.duration}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Session Management</h2>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Calendar className="h-4 w-4 mr-2" />
              Set Availability
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your completed teaching sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{session.subject}</h3>
                        <p className="text-sm text-gray-500">with {session.student}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">${session.earnings}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < session.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="p-3 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1">{session.subject}</h3>
                      <p className="text-sm text-gray-500 mb-2">with {session.student}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {session.date} at {session.time}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Rate</CardTitle>
                <CardDescription>Your hourly rate at {teacherStats.currentLevel} level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {levelBenefits[teacherStats.currentLevel as keyof typeof levelBenefits]?.pay}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">per hour</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
                <CardDescription>Total earnings this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">${teacherStats.monthlyEarnings}</p>
                  <p className="text-sm text-green-600 mt-2">+12% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Level Rate</CardTitle>
                <CardDescription>Rate at {teacherStats.nextLevel} level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {levelBenefits[teacherStats.nextLevel as keyof typeof levelBenefits]?.pay}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">per hour</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceMetrics.attendanceRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Student Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceMetrics.studentSatisfaction}%</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Session Completion</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceMetrics.sessionCompletion}%</p>
                  </div>
                  <Award className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">{performanceMetrics.responseTime}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Video Lesson
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Video Lessons</CardTitle>
              <CardDescription>Upload and manage your recorded tutorials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No video lessons yet</h3>
                <p className="text-gray-500 mb-4">Upload your first video lesson to start earning passive income</p>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
