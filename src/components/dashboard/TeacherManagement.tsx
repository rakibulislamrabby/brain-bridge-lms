'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Star,
  Award,
  TrendingUp,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Calendar
} from 'lucide-react'

export default function TeacherManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')

  // Mock teacher data
  const teachers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      subject: 'JavaScript',
      level: 'Gold',
      rating: 4.9,
      students: 156,
      sessions: 89,
      earnings: 2450,
      joinDate: '2023-01-15',
      status: 'active',
      avatar: '/images/person/p-1.png'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@example.com',
      subject: 'React',
      level: 'Silver',
      rating: 4.7,
      students: 98,
      sessions: 67,
      earnings: 1890,
      joinDate: '2023-03-20',
      status: 'active',
      avatar: '/images/person/p-2.png'
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily@example.com',
      subject: 'Python',
      level: 'Platinum',
      rating: 4.8,
      students: 203,
      sessions: 145,
      earnings: 4200,
      joinDate: '2022-11-10',
      status: 'active',
      avatar: '/images/person/p-3.png'
    },
    {
      id: 4,
      name: 'David Wilson',
      email: 'david@example.com',
      subject: 'Node.js',
      level: 'Bronze',
      rating: 4.5,
      students: 45,
      sessions: 23,
      earnings: 890,
      joinDate: '2023-06-05',
      status: 'pending',
      avatar: '/images/person/p-1.png'
    }
  ]

  const levelColors = {
    Bronze: 'bg-yellow-100 text-yellow-800',
    Silver: 'bg-gray-100 text-gray-800',
    Gold: 'bg-yellow-100 text-yellow-800',
    Platinum: 'bg-purple-100 text-purple-800',
    Master: 'bg-orange-100 text-orange-800'
  }

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterLevel === 'all' || teacher.level === filterLevel
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    pending: teachers.filter(t => t.status === 'pending').length,
    averageRating: (teachers.reduce((sum, t) => sum + t.rating, 0) / teachers.length).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all teachers on the platform</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Users className="h-4 w-4 mr-2" />
          Add New Teacher
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <UserX className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teachers by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Master">Master</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>Manage teacher accounts and monitor their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={levelColors[teacher.level as keyof typeof levelColors]}>
                        {teacher.level}
                      </Badge>
                      <span className="text-sm text-gray-500">• {teacher.subject}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{teacher.rating}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500">rating</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{teacher.students}</p>
                    <p className="text-xs text-gray-500">students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{teacher.sessions}</p>
                    <p className="text-xs text-gray-500">sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-600">${teacher.earnings}</p>
                    <p className="text-xs text-gray-500">earnings</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                    {teacher.status === 'pending' ? (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
