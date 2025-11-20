'use client'

import { useEffect, useState } from 'react'
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
  slotInfo: {
    id: number
    subject: string
    teacher: string
    scheduled_date: string
    start_time: string
    end_time: string
  }
  paymentIntentId: string
}

function PaymentForm({ clientSecret, amount, slotInfo, paymentIntentId }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { addToast } = useToast()
  const confirmBookingMutation = useConfirmBooking()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
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
        // Step 3: Call backend API to confirm booking
        try {
          await confirmBookingMutation.mutateAsync({
            slot_id: slotInfo.id,
            scheduled_date: slotInfo.scheduled_date,
            payment_intent_id: paymentIntentId,
          })
          
          setPaymentStatus('succeeded')
          addToast({
            type: 'success',
            title: 'Payment Successful',
            description: 'Your slot has been reserved successfully!',
            duration: 5000,
          })
          
          // Redirect to success page after a short delay
          setTimeout(() => {
            router.push(`/payment/success?payment_intent=${paymentIntentId}`)
          }, 2000)
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
            router.push(`/payment/success?payment_intent=${paymentIntentId}`)
          }, 2000)
          
          setIsProcessing(false)
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
      {/* Left Side - Booking Details */}
      <div className="lg:sticky lg:top-6 h-fit">
        <Card className="bg-gray-800/80 border border-gray-700">
          <CardHeader className="border-b border-gray-700/70 pb-4">
            <CardTitle className="text-xl text-white-5 pt-5">Booking Summary</CardTitle>
            <p className="text-gray-400 text-sm mt-1">Review your session details</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-4">
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
            </div>

            <div className="pt-4 border-t border-gray-700/70">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300 font-medium">Total Amount</span>
                </div>
                <span className="text-white font-bold text-2xl">${amount}</span>
              </div>
            </div>

            <div className="pt-2">
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
            <p className="text-gray-400 text-sm mt-1">Enter your card details to complete the booking</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
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
                      Pay ${amount}
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

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string
    amount: string
    slotInfo: {
      id: number
      subject: string
      teacher: string
      scheduled_date: string
      start_time: string
      end_time: string
    }
    paymentIntentId: string
  } | null>(null)

  useEffect(() => {
    // Get payment data from sessionStorage (set by handleReserveSlot)
    const storedPaymentData = sessionStorage.getItem('payment_data')
    
    if (storedPaymentData) {
      try {
        const data = JSON.parse(storedPaymentData)
        if (data.client_secret && data.amount && data.slot) {
          setPaymentData({
            clientSecret: data.client_secret,
            amount: data.amount,
            slotInfo: {
              id: data.slot.id,
              subject: data.slot.subject,
              teacher: data.slot.teacher,
              scheduled_date: data.slot.scheduled_date,
              start_time: data.slot.start_time,
              end_time: data.slot.end_time,
            },
            paymentIntentId: data.payment_intent_id || '',
          })
          setIsLoading(false)
          
          // Debug: Log if Stripe key is missing (only in development)
          if (!stripePublishableKey && process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Stripe publishable key not found. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local and restart the dev server.')
          }
        } else {
          throw new Error('Invalid payment data')
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Invalid Payment Data',
          description: 'Please try reserving the slot again.',
          duration: 6000,
        })
        router.push('/live-session')
      }
    } else {
      addToast({
        type: 'error',
        title: 'No Payment Data',
        description: 'Please reserve a slot first.',
        duration: 6000,
      })
      router.push('/live-session')
    }
  }, [router, addToast])

  // Show loading state while fetching payment data
  if (isLoading || !paymentData) {
    return (
      <div>
        <AppHeader />
        <main className="bg-gray-900 min-h-screen py-14">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="bg-gray-800/80 border border-gray-700">
              <CardContent className="py-16 flex justify-center">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Check for Stripe key only after we have payment data
  if (!stripePublishableKey) {
    console.error('❌ Stripe publishable key not found!')
    console.error('Checked for:', [
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLIC_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_PUBLIC_KEY'
    ])
    console.error('💡 Solution: Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local and restart dev server')
    
    return (
      <div>
        <AppHeader />
        <main className="bg-gray-900 min-h-screen py-14">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="bg-gray-800/80 border border-gray-700">
              <CardContent className="py-16 text-center space-y-4">
                <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <p className="text-red-200 font-medium text-lg">Stripe Configuration Error</p>
                
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-left space-y-3">
                  <p className="text-gray-300 font-medium">Steps to fix:</p>
                  <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                    <li>Open your <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file in the project root</li>
                    <li>Add this line (replace with your actual Stripe key):
                      <pre className="bg-gray-950 p-2 rounded mt-1 text-xs overflow-x-auto">
                        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
                      </pre>
                    </li>
                    <li>Save the file</li>
                    <li><strong className="text-yellow-400">Restart your development server</strong> (stop and run <code className="bg-gray-800 px-1 rounded">npm run dev</code> again)</li>
                  </ol>
                </div>

                <div className="bg-blue-900/20 border border-blue-700/60 rounded-lg p-3 text-left">
                  <p className="text-blue-200 text-sm font-medium mb-1">⚠️ Important:</p>
                  <p className="text-blue-300 text-xs">
                    In Next.js, environment variables must start with <code className="bg-blue-950 px-1 rounded">NEXT_PUBLIC_</code> to be accessible on the client side.
                    The variable name must be exactly: <code className="bg-blue-950 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      console.log('Current env check:', {
                        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Found' : 'Not found',
                        NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ? 'Found' : 'Not found',
                      })
                      window.location.reload()
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Check & Reload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Check if Stripe initialized properly
  if (!stripePromise) {
    return (
      <div>
        <AppHeader />
        <main className="bg-gray-900 min-h-screen py-14">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="bg-gray-800/80 border border-gray-700">
              <CardContent className="py-16 text-center space-y-4">
                <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <p className="text-red-200 font-medium">Failed to initialize Stripe</p>
                <p className="text-gray-400 text-sm">
                  Please check your Stripe publishable key configuration and restart the development server.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-purple-600 hover:bg-purple-700 text-white mt-4"
                >
                  Refresh Page
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const options = {
    clientSecret: paymentData.clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#9333ea',
        colorBackground: '#1f2937',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <div>
      <AppHeader />
      <main className="bg-gray-900 min-h-screen py-8 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-gray-800/70 mb-6 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Complete Your Payment</h1>
            <p className="text-gray-400">
              Review your booking details and enter your payment information
            </p>
          </div>

          <Elements stripe={stripePromise} options={options}>
            <PaymentForm
              clientSecret={paymentData.clientSecret}
              amount={paymentData.amount}
              slotInfo={paymentData.slotInfo}
              paymentIntentId={paymentData.paymentIntentId}
            />
          </Elements>
        </div>
      </main>
      <Footer />
    </div>
  )
}

