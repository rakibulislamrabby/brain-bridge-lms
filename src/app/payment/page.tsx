'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import Footer from '@/components/shared/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

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
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)
    setPaymentStatus('processing')

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?payment_intent=${paymentIntentId}`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setPaymentStatus('failed')
        setErrorMessage(error.message || 'Payment failed. Please try again.')
        addToast({
          type: 'error',
          title: 'Payment Failed',
          description: error.message || 'Payment could not be processed.',
          duration: 6000,
        })
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
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
    } finally {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-gray-800/80 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white pt-5">Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Subject:</span>
            <span className="text-white font-medium">{slotInfo.subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Teacher:</span>
            <span className="text-white font-medium">{slotInfo.teacher}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date:</span>
            <span className="text-white font-medium">{formatDate(slotInfo.scheduled_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Time:</span>
            <span className="text-white font-medium">
              {formatTime(slotInfo.start_time)} - {formatTime(slotInfo.end_time)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-700">
            <span className="text-gray-400 text-base">Total Amount:</span>
            <span className="text-white font-bold text-lg">${amount}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/80 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white pt-5">Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentElement />
          
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/60 rounded-md text-red-200">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {paymentStatus === 'succeeded' && (
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700/60 rounded-md text-green-200">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Payment successful! Redirecting...</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isProcessing || paymentStatus === 'succeeded'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || !elements || isProcessing || paymentStatus === 'succeeded'}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
            >
              {isProcessing || paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : paymentStatus === 'succeeded' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Payment Successful
                </>
              ) : (
                `Confirm Payment $${amount}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
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
      <main className="bg-gray-900 min-h-screen py-14">
        <div className="max-w-2xl mx-auto px-4">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-gray-800/70 mb-6 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="bg-gray-800/80 border border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-white pt-5">Complete Your Payment</CardTitle>
              <p className="text-gray-400 mt-2">
                Please enter your card details to complete the reservation
              </p>
            </CardHeader>
          </Card>

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

