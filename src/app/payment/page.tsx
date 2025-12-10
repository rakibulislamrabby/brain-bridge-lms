'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Calendar, Clock, User, BookOpen, DollarSign } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useConfirmBooking } from '@/hooks/slots/use-confirm-booking'
import { useConfirmInPersonBooking } from '@/hooks/slots/use-confirm-in-person-booking'
import { useConfirmPurchase } from '@/hooks/course/use-confirm-purchase'
import { useMe } from '@/hooks/use-me'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SERVICE_FEE } from '@/lib/constants'

// Try multiple possible environment variable names for Stripe publishable key
// Note: In Next.js, only variables prefixed with NEXT_PUBLIC_ are available on the client side
const getStripeKey = () => {
  // Check all possible variable names
  const possibleKeys = [
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    process.env.STRIPE_PUBLISHABLE_KEY,
    process.env.STRIPE_PUBLIC_KEY,
    // Also check window object in case it's set dynamically (for debugging)
    typeof window !== 'undefined' ? (window as any).__STRIPE_PUBLISHABLE_KEY__ : null,
  ].filter(Boolean)
  
  return possibleKeys[0] || ''
}

const stripePublishableKey = getStripeKey()
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

// Debug helper - log available env vars in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const envCheck = {
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✓ Found' : '✗ Not found',
    'NEXT_PUBLIC_STRIPE_PUBLIC_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ? '✓ Found' : '✗ Not found',
    'STRIPE_PUBLISHABLE_KEY': process.env.STRIPE_PUBLISHABLE_KEY ? '✓ Found' : '✗ Not found',
    'STRIPE_PUBLIC_KEY': process.env.STRIPE_PUBLIC_KEY ? '✓ Found' : '✗ Not found',
    'Final key found': stripePublishableKey ? '✓ Yes' : '✗ No',
  }
  console.log('🔍 Stripe Environment Variable Check:', envCheck)
}

interface PaymentFormProps {
  clientSecret: string
  amount: string
  slotInfo?: {
    id: number
    subject: string
    teacher: string
    scheduled_date: string
    start_time: string
    end_time: string
  }
  courseInfo?: {
    id: number
    title: string
    subject: string
    teacher: string
    price: number
    old_price?: number
  }
  paymentIntentId: string
  pointsToUse?: number
  slotType?: string // 'in-person' for in-person slots, undefined/null for live sessions
}

function PaymentForm({ clientSecret, amount, slotInfo, courseInfo, paymentIntentId, pointsToUse: initialPointsToUse, slotType }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { addToast } = useToast()
  const confirmBookingMutation = useConfirmBooking()
  const confirmInPersonBookingMutation = useConfirmInPersonBooking()
  const confirmPurchaseMutation = useConfirmPurchase()
  const { data: user } = useMe()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Points system - read from query params (set on details page)
  const pointsToUse = initialPointsToUse || 0
  
  // The amount from API is already the final amount (after points discount + service fee)
  // Use it directly without recalculating or adding service fee again
  const finalPaymentAmount = parseFloat(amount) || 0
  
console.log("paymentIntentId",paymentIntentId)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)
    setPaymentStatus('processing')

    try {
      // Step 1: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?payment_intent=${paymentIntentId}`,
        },
        redirect: 'if_required',
      })

      if (stripeError) {
        setPaymentStatus('failed')
        setErrorMessage(stripeError.message || 'Payment failed. Please try again.')
        addToast({
          type: 'error',
          title: 'Payment Failed',
          description: stripeError.message || 'Payment could not be processed.',
          duration: 6000,
        })
        setIsProcessing(false)
        return
      }

      // Step 2: Check if payment was successful
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Step 3: Call backend API to confirm booking (only for slots)
        if (slotInfo) {
          try {
            // Use appropriate confirm hook based on slot type
            if (slotType === 'in-person') {
              await confirmInPersonBookingMutation.mutateAsync({
                slot_id: slotInfo.id,
                scheduled_date: slotInfo.scheduled_date,
                payment_intent_id: paymentIntentId,
                points_to_use: pointsToUse,
                new_payment_amount: finalPaymentAmount,
              })
            } else {
              // Live session slot
              await confirmBookingMutation.mutateAsync({
                slot_id: slotInfo.id,
                scheduled_date: slotInfo.scheduled_date,
                payment_intent_id: paymentIntentId,
                points_to_use: pointsToUse,
                new_payment_amount: finalPaymentAmount,
              })
            }
            
            setPaymentStatus('succeeded')
            addToast({
              type: 'success',
              title: 'Payment Successful',
              description: 'Your slot has been reserved successfully!',
              duration: 5000,
            })
            
            // Redirect to success page after a short delay with slot info
            setTimeout(() => {
              const successParams = new URLSearchParams({
                payment_intent: paymentIntentId,
              })
              if (slotInfo) {
                successParams.set('slot', JSON.stringify(slotInfo))
              }
              router.push(`/payment/success?${successParams.toString()}`)
            }, 2000)
            setIsProcessing(false)
          } catch (confirmError) {
            // Payment succeeded but booking confirmation failed
            console.error('🔴 Booking confirmation error:', confirmError)
            const errorMsg = confirmError instanceof Error ? confirmError.message : 'Failed to confirm booking'
            
            // Even if backend API fails, payment was successful, so we can still show success
            // but log the error for debugging
            console.warn('⚠️ Payment succeeded but booking confirmation failed. Payment Intent ID:', paymentIntentId)
            
            setPaymentStatus('succeeded')
            addToast({
              type: 'success',
              title: 'Payment Successful',
              description: 'Your payment was processed successfully. If you encounter any issues, please contact support with Payment ID: ' + paymentIntentId.substring(0, 20) + '...',
              duration: 8000,
            })
            
            // Still redirect to success page since payment was successful
            setTimeout(() => {
              const successParams = new URLSearchParams({
                payment_intent: paymentIntentId,
              })
              if (slotInfo) {
                successParams.set('slot', JSON.stringify(slotInfo))
              }
              router.push(`/payment/success?${successParams.toString()}`)
            }, 2000)
            
            setIsProcessing(false)
          }
        } else if (courseInfo) {
          // Step 3: Call backend API to confirm course purchase
          try {
            await confirmPurchaseMutation.mutateAsync({
              course_id: courseInfo.id,
              payment_intent_id: paymentIntentId,
              points_to_use: pointsToUse,
              new_payment_amount: finalPaymentAmount,
            })
            
            setPaymentStatus('succeeded')
            addToast({
              type: 'success',
              title: 'Payment Successful',
              description: 'You have been enrolled in the course successfully!',
              duration: 5000,
            })
            
            // Redirect to success page after a short delay with slot info
            setTimeout(() => {
              const successParams = new URLSearchParams({
                payment_intent: paymentIntentId,
              })
              if (slotInfo) {
                successParams.set('slot', JSON.stringify(slotInfo))
              }
              router.push(`/payment/success?${successParams.toString()}`)
            }, 2000)
            setIsProcessing(false)
          } catch (confirmError) {
            // Payment succeeded but purchase confirmation failed
            console.error('🔴 Purchase confirmation error:', confirmError)
            const errorMsg = confirmError instanceof Error ? confirmError.message : 'Failed to confirm purchase'
            
            // Even if backend API fails, payment was successful, so we can still show success
            // but log the error for debugging
            console.warn('⚠️ Payment succeeded but purchase confirmation failed. Payment Intent ID:', paymentIntentId)
            
            setPaymentStatus('succeeded')
            addToast({
              type: 'success',
              title: 'Payment Successful',
              description: 'Your payment was processed successfully. If you encounter any issues, please contact support with Payment ID: ' + paymentIntentId.substring(0, 20) + '...',
              duration: 8000,
            })
            
            // Still redirect to success page since payment was successful
            setTimeout(() => {
              router.push(`/payment/success?payment_intent=${paymentIntentId}`)
            }, 2000)
            
            setIsProcessing(false)
          }
        }
      } else {
        // Payment not completed
        setPaymentStatus('failed')
        setErrorMessage('Payment was not completed. Please try again.')
        addToast({
          type: 'error',
          title: 'Payment Not Completed',
          description: 'Payment was not completed. Please try again.',
          duration: 6000,
        })
        setIsProcessing(false)
      }
    } catch (err) {
      setPaymentStatus('failed')
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setErrorMessage(message)
      addToast({
        type: 'error',
        title: 'Payment Error',
        description: message,
        duration: 6000,
      })
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':').map(Number)
      const date = new Date(1970, 0, 1, hours, minutes)
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)
    } catch {
      return timeString
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Left Side - Booking/Course Details */}
      <div className="lg:sticky lg:top-6 h-fit">
        <Card className="bg-gray-800/80 border border-gray-700">
          <CardHeader className="border-b border-gray-700/70 pb-4">
            <CardTitle className="text-xl text-white-5 pt-5">
              {slotInfo ? 'Booking Summary' : 'Course Enrollment'}
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              {slotInfo ? 'Review your session details' : 'Review your course details'}
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-4">
              {slotInfo ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Subject</p>
                      <p className="text-white font-medium">{slotInfo.subject}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Teacher</p>
                      <p className="text-white font-medium">{slotInfo.teacher}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-medium">{formatDate(slotInfo.scheduled_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Time</p>
                      <p className="text-white font-medium">
                        {formatTime(slotInfo.start_time)} - {formatTime(slotInfo.end_time)}
                      </p>
                    </div>
                  </div>
                </>
              ) : courseInfo ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Course Title</p>
                      <p className="text-white font-medium">{courseInfo.title}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Subject</p>
                      <p className="text-white font-medium">{courseInfo.subject}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Instructor</p>
                      <p className="text-white font-medium">{courseInfo.teacher}</p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="pt-4 border-t border-gray-700/70">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <span>Service Fee:</span>
                  <span>${SERVICE_FEE.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 font-medium">Total Amount</span>
                  </div>
                  <span className="text-white font-bold text-2xl">
                    ${finalPaymentAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex items-start gap-2 p-3 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                <div className="mt-0.5">
                  <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-orange-200 text-xs">
                  <strong>$7.95 flat service fee</strong> applies to all purchases.
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="mt-0.5">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-200 text-xs">
                  Your payment is secured by Stripe. Your card details are never stored on our servers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Payment Form */}
      <div>
        <Card className="bg-gray-800/80 border border-gray-700">
          <CardHeader className="border-b border-gray-700/70 pb-4">
            <CardTitle className="text-xl text-white pt-5">Payment Information</CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Enter your card details to complete {slotInfo ? 'the booking' : courseInfo ? 'course enrollment' : 'the payment'}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="stripe-payment-element-dark">
                  <PaymentElement 
                    options={{
                      fields: {
                        billingDetails: 'auto',
                      },
                      layout: 'tabs',
                      wallets: {
                        applePay: 'never',
                        googlePay: 'never',
                      },
                    }}
                  />
                </div>
              </div>
              
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/60 rounded-md text-red-200">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{errorMessage}</span>
                </div>
              )}

              {paymentStatus === 'succeeded' && (
                <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700/60 rounded-md text-green-200">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Payment successful! Redirecting...</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 order-2 sm:order-1"
                  disabled={isProcessing || paymentStatus === 'succeeded'}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!stripe || !elements || isProcessing || paymentStatus === 'succeeded'}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1 order-1 sm:order-2"
                >
                  {isProcessing || paymentStatus === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : paymentStatus === 'succeeded' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Payment Successful
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pay ${finalPaymentAmount.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PaymentPageContent() {
  const searchParams = useSearchParams()
  
  const clientSecret = searchParams.get('client_secret')
  const amount = searchParams.get('amount')
  const paymentIntentId = searchParams.get('payment_intent')
  const pointsToUseParam = searchParams.get('points_to_use')
  const pointsToUse = pointsToUseParam ? parseInt(pointsToUseParam) || 0 : 0
  const slotType = searchParams.get('slot_type') // 'in-person' or null (live session)
  
  // Parse slot info if present
  let slotInfo = null
  const slotParam = searchParams.get('slot')
  if (slotParam) {
    try {
      slotInfo = JSON.parse(slotParam)
      console.log('✅ Parsed slot info:', slotInfo)
    } catch (error) {
      console.error('🔴 Error parsing slot info:', error, 'Raw slot param:', slotParam)
    }
  }
  
  // Parse course info if present
  let courseInfo = null
  const courseParam = searchParams.get('course')
  if (courseParam) {
    try {
      courseInfo = JSON.parse(courseParam)
      console.log('✅ Parsed course info:', courseInfo)
    } catch (error) {
      console.error('🔴 Error parsing course info:', error, 'Raw course param:', courseParam)
    }
  }

  if (!clientSecret || !amount || !paymentIntentId) {
    return (
      <div className="text-center text-red-400 py-10">
        <p className="text-lg mb-2">Missing payment information</p>
        <p className="text-sm text-gray-400">Please go back and try again.</p>
        <p className="text-xs text-gray-500 mt-2">
          Missing: {!clientSecret && 'client_secret '}{!amount && 'amount '}{!paymentIntentId && 'payment_intent'}
        </p>
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="text-center text-red-400 py-10">
        Failed to initialize Stripe. Please check your configuration.
      </div>
    )
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#8B5CF6',
            colorBackground: '#1F2937',
            colorText: '#FFFFFF',
            colorDanger: '#EF4444',
            fontFamily: "'Hubot Sans', Inter, sans-serif",
            spacingUnit: '4px',
            borderRadius: '0.5rem',
          },
          rules: {
            '.Input': {
              backgroundColor: '#374151',
              borderColor: '#4B5563',
              color: '#FFFFFF',
              padding: '12px',
            },
            '.Input:focus': {
              borderColor: '#8B5CF6',
              boxShadow: '0 0 0 1px #8B5CF6',
            },
            '.Label': {
              color: '#D1D5DB',
              fontWeight: '500',
              marginBottom: '8px',
            },
            '.Tab': {
              backgroundColor: '#374151',
              borderColor: '#4B5563',
              color: '#D1D5DB',
            },
            '.Tab--selected': {
              backgroundColor: '#8B5CF6',
              borderColor: '#8B5CF6',
              color: '#FFFFFF',
            },
            '.TabLabel': {
              color: 'inherit',
            },
            '.Error': {
              color: '#EF4444',
            },
          },
        },
      }}
    >
      <PaymentForm
        clientSecret={clientSecret}
        amount={amount}
        slotInfo={slotInfo || undefined}
        courseInfo={courseInfo || undefined}
        paymentIntentId={paymentIntentId}
        pointsToUse={pointsToUse}
        slotType={slotType || undefined}
      />
    </Elements>
  )
}

export default function PaymentPage() {
  return (
    <>
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Suspense fallback={<div className="text-white">Loading payment...</div>}>
          <PaymentPageContent />
        </Suspense>
      </div>
      <Footer />
    </>
  )
}

