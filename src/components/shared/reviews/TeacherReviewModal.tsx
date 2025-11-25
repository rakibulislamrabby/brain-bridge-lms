'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useTeacherReview } from '@/hooks/slots/use-teacher-review'
import { useToast } from '@/components/ui/toast'

interface TeacherReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slotId: number
  teacherName?: string
}

export default function TeacherReviewModal({
  open,
  onOpenChange,
  slotId,
  teacherName = 'this teacher'
}: TeacherReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({})
  
  const reviewMutation = useTeacherReview()
  const { addToast } = useToast()

  const handleRatingClick = (value: number) => {
    setRating(value)
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: undefined }))
    }
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: { rating?: string; comment?: string } = {}
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating'
    }
    
    if (!comment.trim()) {
      newErrors.comment = 'Please enter a comment'
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        duration: 3000,
      })
      return
    }

    try {
      await reviewMutation.mutateAsync({
        slot_id: slotId,
        rating,
        comment: comment.trim(),
      })

      addToast({
        type: 'success',
        title: 'Review Submitted',
        description: 'Thank you for your review! It has been submitted successfully.',
        duration: 3000,
      })

      // Reset form and close modal
      setRating(0)
      setComment('')
      setErrors({})
      onOpenChange(false)
      
      // Dispatch event to notify parent component that review was submitted
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('slotReviewSubmitted', { detail: { slotId } }))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review. Please try again.'
      
      // Handle "already reviewed" error specifically
      if (errorMessage.toLowerCase().includes('already reviewed')) {
        addToast({
          type: 'error',
          title: 'Already Reviewed',
          description: 'You have already submitted a review for this session.',
          duration: 5000,
        })
        // Close modal and notify parent that this slot is already reviewed
        onOpenChange(false)
        // Dispatch event to notify parent component
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('slotAlreadyReviewed', { detail: { slotId } }))
        }
      } else {
        addToast({
          type: 'error',
          title: 'Submission Failed',
          description: errorMessage,
          duration: 5000,
        })
      }
    }
  }

  const handleClose = () => {
    if (!reviewMutation.isPending) {
      setRating(0)
      setComment('')
      setErrors({})
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Review Teacher
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Share your experience with {teacherName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-white">
              Rating <span className="text-red-400">*</span>
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                  aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      value <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-700 text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-red-400">{errors.rating}</p>
            )}
            {rating > 0 && (
              <p className="text-sm text-gray-400">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-white">
              Comment <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Share your thoughts about this session..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 min-h-[120px]"
              rows={5}
            />
            {errors.comment && (
              <p className="text-sm text-red-400">{errors.comment}</p>
            )}
            <p className="text-xs text-gray-400">
              {comment.length} / 500 characters (minimum 10)
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={reviewMutation.isPending}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={reviewMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

