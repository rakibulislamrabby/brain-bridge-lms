'use client'

import Pusher from 'pusher-js'

// Pusher configuration
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || ''
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1'

let pusherInstance: Pusher | null = null

export const getPusherInstance = (): Pusher | null => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!PUSHER_KEY) {
    console.warn('Pusher key not configured')
    return null
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    })
  }

  return pusherInstance
}

export const disconnectPusher = () => {
  if (pusherInstance) {
    pusherInstance.disconnect()
    pusherInstance = null
  }
}

// Generate consistent channel name from two user IDs
// This ensures both users subscribe to the same channel
export const getChatChannelName = (userId1: number, userId2: number): string => {
  // Sort IDs to ensure consistent channel name regardless of order
  const sorted = [userId1, userId2].sort((a, b) => a - b)
  return `chat.${sorted[0]}.${sorted[1]}`
}

// Subscribe to a chat channel using user IDs
// Subscribes to multiple channel formats to ensure we catch messages
export const subscribeToChat = (
  currentUserId: number,
  otherUserId: number,
  onMessage: (message: any) => void,
  onError?: (error: any) => void
) => {
  const pusher = getPusherInstance()
  if (!pusher) {
    console.warn('Pusher not initialized')
    return () => {}
  }

  // Subscribe to multiple possible channel formats
  // Format 1: Combined channel (chat.user1.user2) - sorted for consistency
  const combinedChannelName = getChatChannelName(currentUserId, otherUserId)
  const combinedChannel = pusher.subscribe(combinedChannelName)
  
  // Format 2: Receiver-based channel (chat.receiver_id) - backend might use this
  const receiverChannelName = `chat.${otherUserId}`
  const receiverChannel = pusher.subscribe(receiverChannelName)
  
  // Format 3: Sender-based channel (chat.sender_id) - in case backend uses sender perspective
  const senderChannelName = `chat.${currentUserId}`
  const senderChannel = pusher.subscribe(senderChannelName)
  
  const handleMessage = (data: any) => {
    console.log('Pusher message received:', data)
    onMessage(data)
  }

  // Bind message event to all channels
  combinedChannel.bind('message', handleMessage)
  receiverChannel.bind('message', handleMessage)
  senderChannel.bind('message', handleMessage)

  combinedChannel.bind('pusher:subscription_succeeded', () => {
    console.log(`Successfully subscribed to channel: ${combinedChannelName}`)
  })

  receiverChannel.bind('pusher:subscription_succeeded', () => {
    console.log(`Successfully subscribed to channel: ${receiverChannelName}`)
  })

  senderChannel.bind('pusher:subscription_succeeded', () => {
    console.log(`Successfully subscribed to channel: ${senderChannelName}`)
  })

  const handleError = (error: any) => {
    console.error('Pusher subscription error:', error)
    if (onError) {
      onError(error)
    }
  }

  combinedChannel.bind('pusher:subscription_error', handleError)
  receiverChannel.bind('pusher:subscription_error', handleError)
  senderChannel.bind('pusher:subscription_error', handleError)

  // Return unsubscribe function
  return () => {
    pusher.unsubscribe(combinedChannelName)
    pusher.unsubscribe(receiverChannelName)
    pusher.unsubscribe(senderChannelName)
    console.log(`Unsubscribed from chat channels`)
  }
}

