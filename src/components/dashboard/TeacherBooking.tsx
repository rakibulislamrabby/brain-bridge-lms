'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  Star,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface TimeSlot {
  id: string
  time: string
  available: boolean
  bookedBy?: string
}

interface Teacher {
  id: number
  name: string
  email: string
  avatar: string
  subject: string
  level: string
  rating: number
  students: number
  sessions: number
  price: number
  bio: string
  specialties: string[]
  availability: {
    [key: string]: TimeSlot[]
  }
  timezone: string
  languages: string[]
  experience: string
}

export default function TeacherBooking() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [expandedTeacher, setExpandedTeacher] = useState<number | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)

  // Mock teacher data with availability
  const teachers: Teacher[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      avatar: '/images/person/p-1.png',
      subject: 'JavaScript',
      level: 'Intermediate',
      rating: 4.9,
      students: 1250,
      sessions: 3200,
      price: 45,
      bio: 'Experienced JavaScript developer with 8+ years in web development. Specializes in React, Node.js, and modern JavaScript frameworks.',
      specialties: ['React', 'Node.js', 'TypeScript', 'Web Development'],
      timezone: 'EST',
      languages: ['English', 'Spanish'],
      experience: '8+ years',
      availability: {
        '2024-01-20': [
          { id: '1', time: '09:00', available: true },
          { id: '2', time: '10:00', available: false, bookedBy: 'Mike Chen' },
          { id: '3', time: '11:00', available: true },
          { id: '4', time: '14:00', available: true },
          { id: '5', time: '15:00', available: true },
          { id: '6', time: '16:00', available: false, bookedBy: 'Emily Davis' }
        ],
        '2024-01-21': [
          { id: '7', time: '09:00', available: true },
          { id: '8', time: '10:00', available: true },
          { id: '9', time: '11:00', available: true },
          { id: '10', time: '14:00', available: false, bookedBy: 'John Smith' },
          { id: '11', time: '15:00', available: true },
          { id: '12', time: '16:00', available: true }
        ],
        '2024-01-22': [
          { id: '13', time: '09:00', available: true },
          { id: '14', time: '10:00', available: true },
          { id: '15', time: '11:00', available: true },
          { id: '16', time: '14:00', available: true },
          { id: '17', time: '15:00', available: true },
          { id: '18', time: '16:00', available: true }
        ]
      }
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      avatar: '/images/person/p-2.png',
      subject: 'Python',
      level: 'Advanced',
      rating: 4.8,
      students: 980,
      sessions: 2100,
      price: 50,
      bio: 'Data scientist and Python expert with 10+ years of experience. Specializes in machine learning, data analysis, and AI.',
      specialties: ['Machine Learning', 'Data Science', 'Pandas', 'NumPy', 'TensorFlow'],
      timezone: 'PST',
      languages: ['English', 'Mandarin'],
      experience: '10+ years',
      availability: {
        '2024-01-20': [
          { id: '19', time: '08:00', available: true },
          { id: '20', time: '09:00', available: true },
          { id: '21', time: '10:00', available: false, bookedBy: 'Alice Brown' },
          { id: '22', time: '13:00', available: true },
          { id: '23', time: '14:00', available: true },
          { id: '24', time: '15:00', available: true }
        ],
        '2024-01-21': [
          { id: '25', time: '08:00', available: true },
          { id: '26', time: '09:00', available: true },
          { id: '27', time: '10:00', available: true },
          { id: '28', time: '13:00', available: true },
          { id: '29', time: '14:00', available: false, bookedBy: 'David Wilson' },
          { id: '30', time: '15:00', available: true }
        ],
        '2024-01-22': [
          { id: '31', time: '08:00', available: true },
          { id: '32', time: '09:00', available: true },
          { id: '33', time: '10:00', available: true },
          { id: '34', time: '13:00', available: true },
          { id: '35', time: '14:00', available: true },
          { id: '36', time: '15:00', available: true }
        ]
      }
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      avatar: '/images/person/p-3.png',
      subject: 'React',
      level: 'Beginner',
      rating: 4.7,
      students: 750,
      sessions: 1800,
      price: 40,
      bio: 'Frontend developer specializing in React and modern web technologies. Passionate about teaching and helping beginners.',
      specialties: ['React', 'JavaScript', 'HTML/CSS', 'Frontend Development'],
      timezone: 'CST',
      languages: ['English'],
      experience: '5+ years',
      availability: {
        '2024-01-20': [
          { id: '37', time: '10:00', available: true },
          { id: '38', time: '11:00', available: true },
          { id: '39', time: '12:00', available: false, bookedBy: 'Tom Johnson' },
          { id: '40', time: '15:00', available: true },
          { id: '41', time: '16:00', available: true },
          { id: '42', time: '17:00', available: true }
        ],
        '2024-01-21': [
          { id: '43', time: '10:00', available: true },
          { id: '44', time: '11:00', available: true },
          { id: '45', time: '12:00', available: true },
          { id: '46', time: '15:00', available: true },
          { id: '47', time: '16:00', available: false, bookedBy: 'Lisa Wang' },
          { id: '48', time: '17:00', available: true }
        ],
        '2024-01-22': [
          { id: '49', time: '10:00', available: true },
          { id: '50', time: '11:00', available: true },
          { id: '51', time: '12:00', available: true },
          { id: '52', time: '15:00', available: true },
          { id: '53', time: '16:00', available: true },
          { id: '54', time: '17:00', available: true }
        ]
      }
    }
  ]

  const subjects = ['All', 'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Machine Learning']
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

  // Get available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const availableDates = getAvailableDates()

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = selectedSubject === 'all' || teacher.subject === selectedSubject
    const matchesLevel = selectedLevel === 'all' || teacher.level === selectedLevel
    return matchesSearch && matchesSubject && matchesLevel
  })

  const toggleTeacherExpansion = (teacherId: number) => {
    setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId)
  }

  const handleTimeSlotSelect = (teacherId: number, timeSlotId: string) => {
    setSelectedTimeSlot(`${teacherId}-${timeSlotId}`)
  }

  const handleBooking = (teacherId: number, timeSlotId: string, date: string, time: string) => {
    // Here you would implement the booking logic
    alert(`Booking confirmed!\nTeacher: ${teachers.find(t => t.id === teacherId)?.name}\nDate: ${date}\nTime: ${time}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book One-to-One Sessions</h1>
          <p className="text-gray-600 mt-2">Find and book personalized learning sessions with expert teachers</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Available for next 7 days</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Teachers</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, subject, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject === 'All' ? 'all' : subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level} value={level === 'All' ? 'all' : level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select a date</option>
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <div className="space-y-4">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-600">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{teacher.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {teacher.subject} • {teacher.level} • {teacher.experience}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{teacher.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">{teacher.students} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{teacher.sessions} sessions</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">${teacher.price}/hr</div>
                  <div className="text-sm text-gray-500">{teacher.timezone}</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Bio and Specialties */}
                <div>
                  <p className="text-gray-600 mb-3">{teacher.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Available Time Slots</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTeacherExpansion(teacher.id)}
                  >
                    {expandedTeacher === teacher.id ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Availability
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show Availability
                      </>
                    )}
                  </Button>
                </div>

                {/* Availability Calendar */}
                {expandedTeacher === teacher.id && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {availableDates.map(date => (
                        <div key={date} className="space-y-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </h4>
                          <div className="grid grid-cols-2 gap-1">
                            {teacher.availability[date]?.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => slot.available && handleTimeSlotSelect(teacher.id, slot.id)}
                                disabled={!slot.available}
                                className={`p-2 text-xs rounded border transition-colors ${
                                  slot.available
                                    ? selectedTimeSlot === `${teacher.id}-${slot.id}`
                                      ? 'bg-orange-500 text-white border-orange-500'
                                      : 'bg-white text-gray-700 border-gray-300 hover:bg-orange-50 hover:border-orange-300'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                }`}
                              >
                                {slot.time}
                                {!slot.available && (
                                  <div className="text-xs text-red-500 mt-1">Booked</div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Booking Button */}
                    {selectedTimeSlot && selectedTimeSlot.startsWith(`${teacher.id}-`) && selectedDate && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Ready to Book?</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(selectedDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })} at {teacher.availability[selectedDate]?.find(s => s.id === selectedTimeSlot.split('-')[1])?.time}
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              const timeSlotId = selectedTimeSlot.split('-')[1]
                              const timeSlot = teacher.availability[selectedDate]?.find(s => s.id === timeSlotId)
                              if (timeSlot) {
                                handleBooking(teacher.id, timeSlotId, selectedDate, timeSlot.time)
                              }
                            }}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Book Session
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTeachers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <Button 
              onClick={() => {
                setSearchTerm('')
                setSelectedSubject('all')
                setSelectedLevel('all')
                setSelectedDate('')
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

