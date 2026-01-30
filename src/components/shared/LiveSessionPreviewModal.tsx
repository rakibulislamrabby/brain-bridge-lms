'use client'

import React from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Clock, 
  Users, 
  DollarSign,
  Play,
  Calendar,
  Award,
  Video as VideoIcon
} from 'lucide-react'

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL

const resolveMediaUrl = (path?: string | null) => {
  if (!path) {
    return null
  }

  // if (/^https?:\/\//i.test(path)) {
  //   return path
  // }

  if (!MEDIA_BASE_URL) {
    return null
  }

  const base = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`
  
  if (path.startsWith('videos/') || path.startsWith('/videos/')) {
    const cleanedPath = path.replace(/^\/?videos\//, '').replace(/^\/+/, '')
    return `${base}storage/videos/${cleanedPath}`
  }
  
  const cleanedPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '')
  return `${base}storage/${cleanedPath}`
}

interface LiveSessionPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: any
}

const formatDateTime = (
  fromDate?: string, 
  toDate?: string, 
  slots?: any[]
) => {
  let dateLabel = 'Date TBD'
  let timeLabel = 'Time TBD'

  // Format time from slots if available
  if (slots && slots.length > 0) {
    const days = slots.map(s => s.slot_day.substring(0, 3)).join(', ')
    const firstTime = slots[0].times?.[0]
    if (firstTime) {
      try {
        const start = new Date(`1970-01-01T${firstTime.start_time}`)
        const startFormatted = start.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
        timeLabel = `${days} • ${startFormatted}+`
      } catch (e) {
        timeLabel = days
      }
    } else {
      timeLabel = days
    }
  }

  if (fromDate && toDate) {
    try {
      const from = new Date(fromDate)
      const to = new Date(toDate)
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
        const fromFormatted = from.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        const toFormatted = to.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        dateLabel = fromFormatted === toFormatted ? fromFormatted : `${fromFormatted} - ${toFormatted}`
      }
    } catch (error) {
      // Keep default
    }
  }

  return { dateLabel, timeLabel }
}

export default function LiveSessionPreviewModal({
  open,
  onOpenChange,
  session
}: LiveSessionPreviewModalProps) {
  if (!session) return null

  const videoUrl = resolveMediaUrl(session.video) || session.video
  const { dateLabel, timeLabel } = formatDateTime(session.from_date, session.to_date, session.slots)
  const priceLabel = session.price ? `$${Number(session.price).toFixed(2)}` : 'Free'
  const subjectName = session.subject?.name || 'General Subject'
  const teacherName = session.teacher?.name || 'Unknown Master'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[95vw] sm:!w-[90vw] lg:!w-[85vw] !max-w-[1200px] max-h-[90vh] bg-gray-900 border-gray-700 p-0 overflow-hidden"
        style={{ 
          width: '95vw', 
          maxWidth: '1200px',
        }}
      >
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-hidden">
          {/* Left Side - Video Player */}
          <div className="lg:w-2/3 bg-gray-900 p-3 sm:p-4 lg:p-6 flex flex-col overflow-y-auto overflow-x-hidden pb-4 sm:pb-6 custom-scrollbar">
            {/* Video Player Section */}
            {videoUrl ? (
              <div className="mb-3">
                <div className="relative w-full sm:w-[80%] mx-auto rounded-lg overflow-hidden border border-gray-700 bg-black shadow-2xl">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
                  >
                    <video
                      controls
                      autoPlay
                      className="absolute inset-0 h-full w-full object-cover"
                      preload="metadata"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <Play className="w-3 h-3" />
                  <span>Introduction Video</span>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <div className="relative w-full sm:w-[80%] mx-auto rounded-lg overflow-hidden border border-gray-700 bg-gray-800 shadow-2xl">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: '56.25%' }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <VideoIcon className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Video preview not available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogHeader className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-600/20 text-purple-300 border border-purple-600/40 text-xs">
                  {subjectName}
                </Badge>
                {session.type && (
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs">
                    {session.type === 'one_to_one' ? 'One-to-One' : session.type.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl lg:text-2xl font-bold text-white text-left line-clamp-2">
                {session.title || 'Live Session'}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-left mt-1 text-sm line-clamp-3">
                {session.description || 'Join this live session for personalized guidance and interactive learning.'}
              </DialogDescription>
            </DialogHeader>

            {/* Session Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 sm:mb-0">
              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-xs line-clamp-1">{dateLabel}</p>
                  <p className="text-[10px] text-gray-400">Date</p>
                </div>
              </div>
              {timeLabel && timeLabel !== 'Time TBD' && (
                <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white text-xs line-clamp-1">{timeLabel}</p>
                    <p className="text-[10px] text-gray-400">Time</p>
                  </div>
                </div>
              )}
              {session.available_seats !== undefined && (
                <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                  <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white text-xs">{session.available_seats}</p>
                    <p className="text-[10px] text-gray-400">Seats</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-xs">{priceLabel}</p>
                  <p className="text-[10px] text-gray-400">Price</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="lg:w-1/3 bg-gray-800/50 border-t lg:border-t-0 lg:border-l border-gray-700 p-3 sm:p-4 lg:p-6 pb-6 sm:pb-8 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="space-y-3 sm:space-y-4">
              {/* Master Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-white font-black text-lg">
                    {teacherName[0] || 'M'}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{teacherName}</p>
                    <p className="text-xs text-gray-400">Expert Master</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Award className="w-3 h-3 text-purple-400" />
                  <span>Verified Professional</span>
                </div>
              </div>

              {/* Session Details */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Session Details</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                    <span className="text-gray-400">Subject</span>
                    <span className="text-white font-medium">{subjectName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                    <span className="text-gray-400">Type</span>
                    <span className="text-white font-medium">
                      {session.type === 'one_to_one' ? 'One-to-One' : session.type?.replace(/_/g, ' ') || 'Group'}
                    </span>
                  </div>
                  {session.max_students && (
                    <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
                      <span className="text-gray-400">Max Students</span>
                      <span className="text-white font-medium">{session.max_students}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">Price</span>
                    <span className="text-white font-medium">{priceLabel}</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                asChild
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 sm:py-2 text-sm font-semibold mt-auto"
                onClick={() => onOpenChange(false)}
              >
                <Link href={`/live-session/${session.id}`}>
                  View Full Session & Book
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
